'use client'

// Live canvas recording to MP4/H.264 via MediaBunny (WebCodecs plus an MP4
// muxer in one package). Reusable across LAB tools: pass any HTMLCanvasElement
// to start(). All work is local: no upload, no server. The hook keeps a
// 20-second cap, a color-boost pass, a gl.finish() call against stale
// textures, and encoder backpressure.

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Output,
  Mp4OutputFormat,
  BufferTarget,
  CanvasSource,
  Input,
  BufferSource,
  Conversion,
  ALL_FORMATS,
  type VideoCodec,
} from 'mediabunny'

/**
 * Post-recording handoff. When set, the recorder is idle but a finalised
 * MP4 buffer is sitting in memory waiting for the user to pick an export
 * variant (60fps as-is, or 30fps re-encoded). The page-level UI uses this
 * to decide whether to show the download-options popup.
 */
export type PendingRecording = {
  buffer: ArrayBuffer
  /** Filename root, no extension or fps suffix. e.g. "60k-particles-2026-05-18T12-34-56". */
  baseFilename: string
  /** Wall-clock duration of the capture, used to estimate transcoded size. */
  durationSec: number
  /** fps the buffer was captured at — pass-through downloads use this label. */
  sourceFps: number
  /** Bytes — used for the popup's "~XX MB" size hint on the pass-through path. */
  sizeBytes: number
}

export type RecorderState = 'idle' | 'recording' | 'encoding'

export type RecorderOptions = {
  fps?: number
  filename?: string
  /**
   * Sample the live canvas into an offscreen 2D context and apply a small
   * saturation/contrast bump before encoding, to compensate for the H.264
   * encoder's BT.709 limited-range squash. Off by default — turn on if
   * recordings look duller than the live view.
   */
  colorBoost?: boolean
  /**
   * Auto-stop after this many milliseconds. Prevents runaway captures
   * that would eat all available RAM (every encoded chunk is held in
   * memory via BufferTarget until finalize). Omit for no cap.
   */
  maxDurationMs?: number
}

// Output is locked to fixed 1080p. This decouples the exported file from the
// preview pane's CSS size and the user's display DPR — every recording lands
// at exactly 1920×1080 regardless of where it was captured, so file sizes are
// predictable and downstream re-encodes (e.g. the 30fps transcode) have a
// known input geometry.
const OUTPUT_WIDTH = 1920
const OUTPUT_HEIGHT = 1080

type Session = {
  output: Output<Mp4OutputFormat, BufferTarget>
  source: CanvasSource
  rafId: number
  startTime: number
  /** Monotonic frame counter — also used to compute timestamps. */
  frameIndex: number
  width: number
  height: number
  filename: string
  fps: number
  /**
   * Intermediate 1920×1080 canvas. Each captured WebGL frame is drawn into
   * this canvas (letterboxed to preserve aspect, optional color-boost filter)
   * and MediaBunny encodes from here. Always present — replaces both the
   * direct-WebGL-canvas path and the colorBoost-only offscreen path.
   */
  targetCanvas: HTMLCanvasElement
  targetCtx: CanvasRenderingContext2D
  /** The original WebGL canvas — used for gl.finish() + connection check. */
  webglCanvas: HTMLCanvasElement
  /**
   * MediaBunny's add() returns a Promise that resolves when the encoder is
   * ready for more. We don't await inside RAF (would block the next tick);
   * instead we set this flag false before add() and true in .then(), and skip
   * frames while false. This is the official live-capture pattern.
   */
  readyForMoreFrames: boolean
  /** Bitrate handed to the encoder, for the info readout. */
  bitrateBps: number
}

/**
 * Letterbox the source canvas into a fixed-aspect destination. Returns the
 * draw rectangle to pass to ctx.drawImage. Bars are filled by the caller.
 */
function computeFit(srcW: number, srcH: number, dstW: number, dstH: number) {
  if (srcW <= 0 || srcH <= 0) return { x: 0, y: 0, w: dstW, h: dstH }
  const srcAspect = srcW / srcH
  const dstAspect = dstW / dstH
  if (srcAspect > dstAspect) {
    // Source is wider — fit width, bars top/bottom.
    const w = dstW
    const h = Math.round(dstW / srcAspect)
    return { x: 0, y: Math.round((dstH - h) / 2), w, h }
  }
  // Source is taller (or equal) — fit height, bars left/right.
  const h = dstH
  const w = Math.round(dstH * srcAspect)
  return { x: Math.round((dstW - w) / 2), y: 0, w, h }
}

/**
 * Resolution-aware variable bitrate. Same formula our previous stack used as
 * a fallback (0.20 bpp for H.264). Clamped to [10, 100] Mbps. We pass an
 * explicit number rather than QUALITY_VERY_HIGH so the encoder gets the same
 * bandwidth target as our previous QP-18 path typically produced, which
 * makes the A/B comparison meaningful.
 */
function computeBitrate(width: number, height: number, fps: number) {
  const target = Math.round(width * height * fps * 0.20)
  return Math.min(100_000_000, Math.max(10_000_000, target))
}

function isSupported() {
  return (
    typeof window !== 'undefined' &&
    typeof VideoEncoder !== 'undefined' &&
    typeof VideoFrame !== 'undefined'
  )
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

export type RecorderInfo = {
  codec: VideoCodec
  container: 'avc' | 'hevc'
  width: number
  height: number
  bitrateMbps?: number
  quantizer?: number
}

export function useCanvasRecorder() {
  const [state, setState] = useState<RecorderState>('idle')
  const [elapsedMs, setElapsedMs] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<RecorderInfo | null>(null)
  /**
   * Finalised buffer waiting on the user's download choice. Cleared when the
   * user picks a variant or dismisses the popup. Survives across re-renders;
   * cleared on hook unmount.
   */
  const [pending, setPending] = useState<PendingRecording | null>(null)
  /** True while the 30fps re-encode is in flight, for popup loading state. */
  const [transcoding, setTranscoding] = useState(false)
  const sessionRef = useRef<Session | null>(null)
  const startingRef = useRef(false)
  const tickRef = useRef<number | null>(null)

  const cleanup = useCallback(() => {
    const s = sessionRef.current
    if (s) {
      cancelAnimationFrame(s.rafId)
      // cancel() may reject if the output is already finalized or never
      // started; swallow either way — we just want the encoder torn down.
      s.output.cancel().catch(() => { /* swallow */ })
      sessionRef.current = null
    }
    if (tickRef.current !== null) {
      cancelAnimationFrame(tickRef.current)
      tickRef.current = null
    }
  }, [])

  useEffect(() => () => cleanup(), [cleanup])

  const stop = useCallback(async () => {
    const s = sessionRef.current
    if (!s) return
    cancelAnimationFrame(s.rafId)
    if (tickRef.current !== null) {
      cancelAnimationFrame(tickRef.current)
      tickRef.current = null
    }
    setState('encoding')
    const durationSec = (performance.now() - s.startTime) / 1000
    try {
      s.source.close()
      await s.output.finalize()
      const buf = s.output.target.buffer
      if (!buf) throw new Error('Encoder produced no output')
      // Drop the .mp4 extension if the caller put one on; we re-add it with
      // the fps suffix in the download step.
      const base = s.filename.replace(/\.mp4$/i, '')
      setPending({
        buffer: buf,
        baseFilename: base,
        durationSec,
        sourceFps: s.fps,
        sizeBytes: buf.byteLength,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      sessionRef.current = null
      setState('idle')
    }
  }, [])

  /**
   * Hand off the recording at the user's chosen fps. The captured fps is
   * downloaded as-is (instant); any other fps runs through MediaBunny's
   * Conversion API, which re-encodes at the new frame rate.
   *
   * Fire-and-forget: this returns immediately for the fast path and
   * runs the transcode in the background for the slow path. Pending state
   * is NOT cleared here — callers (the popup) close themselves on a short
   * timer after invoking this, so the user gets a quick acknowledgement
   * and the file appears in their downloads when the transcode finishes.
   * Any error from a background transcode surfaces via `error` state.
   */
  const downloadRecording = useCallback(
    (targetFps: number) => {
      const rec = pending
      if (!rec) return
      const mime = 'video/mp4'
      const filenameFor = (fps: number) => `${rec.baseFilename}-${fps}fps.mp4`

      // Fast path: user picked the fps we already encoded at. Instant.
      if (targetFps === rec.sourceFps) {
        triggerDownload(new Blob([rec.buffer], { type: mime }), filenameFor(targetFps))
        return
      }

      // Slow path: re-encode at the new fps in the background. Buffer is
      // captured into the closure, so dismissing `pending` while this runs
      // doesn't break anything.
      setTranscoding(true)
      setError(null)
      ;(async () => {
        try {
          const input = new Input({
            source: new BufferSource(rec.buffer),
            formats: ALL_FORMATS,
          })
          const output = new Output({
            format: new Mp4OutputFormat({ fastStart: 'in-memory' }),
            target: new BufferTarget(),
          })
          const conversion = await Conversion.init({
            input,
            output,
            video: {
              codec: 'avc',
              frameRate: targetFps,
              // Match the bitrate formula used during capture so quality
              // is comparable. 30fps at the same bpp is ~half the bitrate.
              bitrate: computeBitrate(OUTPUT_WIDTH, OUTPUT_HEIGHT, targetFps),
            },
          })
          await conversion.execute()
          const buf = output.target.buffer
          if (!buf) throw new Error('Re-encode produced no output')
          triggerDownload(new Blob([buf], { type: mime }), filenameFor(targetFps))
        } catch (e) {
          setError(e instanceof Error ? e.message : String(e))
        } finally {
          setTranscoding(false)
        }
      })()
    },
    [pending],
  )

  const dismissRecording = useCallback(() => {
    setPending(null)
    setError(null)
  }, [])

  const start = useCallback(
    async (canvas: HTMLCanvasElement, opts: RecorderOptions = {}) => {
      // Guards against (1) a second start while a session is live and
      // (2) a second start fired during the async setup window before
      // sessionRef is populated. Without the second guard a rapid double-
      // click on Record would create two encoders, leaking the first.
      if (sessionRef.current || startingRef.current) return
      startingRef.current = true
      setError(null)

      if (!isSupported()) {
        setError('Your browser does not support WebCodecs recording. Try Chrome, Edge, Safari 16.4+, or Firefox 130+.')
        startingRef.current = false
        return
      }

      const fps = opts.fps ?? 60
      const filename = opts.filename ?? `recording-${Date.now()}.mp4`
      const colorBoost = opts.colorBoost ?? false
      const maxDurationMs = opts.maxDurationMs ?? Infinity

      // Sanity check on the source canvas. If WebGL hasn't allocated a real
      // buffer yet we have nothing to capture from.
      if (canvas.width < 16 || canvas.height < 16) {
        setError(`Canvas is too small to record (${canvas.width}×${canvas.height}).`)
        startingRef.current = false
        return
      }

      // Output is always 1920×1080. The intermediate canvas absorbs both the
      // resolution lock and the optional color-boost filter — every frame is
      // drawn into it (letterboxed) and MediaBunny encodes from it.
      const width = OUTPUT_WIDTH
      const height = OUTPUT_HEIGHT
      const targetCanvas = document.createElement('canvas')
      targetCanvas.width = width
      targetCanvas.height = height
      const targetCtx = targetCanvas.getContext('2d', {
        alpha: false,
        colorSpace: 'srgb',
        desynchronized: true,
      })
      if (!targetCtx) {
        setError('Failed to create the offscreen 2D context for recording.')
        startingRef.current = false
        return
      }
      // Color boost compensates for the BT.709 limited-range squash H.264
      // applies during encode. Filter is set once and applies to every
      // subsequent drawImage in the capture loop.
      if (colorBoost) targetCtx.filter = 'saturate(1.18) contrast(1.08)'
      const bitrateBps = computeBitrate(width, height, fps)

      // Build the MediaBunny pipeline. CanvasSource reads pixels from the
      // given canvas at the moment add() is called. We use 'avc' (H.264)
      // because it remains the most broadly playable container/codec combo
      // for downloaded MP4s. Realtime latency mode lets the encoder drop
      // its own frames if it falls behind — paired with our skip-while-busy
      // logic below, this keeps capture stable on weaker hardware.
      const output = new Output({
        format: new Mp4OutputFormat({ fastStart: 'in-memory' }),
        target: new BufferTarget(),
      })

      const source = new CanvasSource(targetCanvas, {
        codec: 'avc',
        bitrate: bitrateBps,
        bitrateMode: 'variable',
        // 'quality' mode matches the old raw-WebCodecs behaviour: the encoder
        // never drops frames internally, it just makes us wait. Paired with
        // our readyForMoreFrames skip-while-busy logic the loop stays stable
        // under load. 'realtime' here was producing silent early stops on
        // long captures.
        latencyMode: 'quality',
        keyFrameInterval: 1,
        hardwareAcceleration: 'prefer-hardware',
      })
      output.addVideoTrack(source, { frameRate: fps })

      try {
        await output.start()
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e))
        startingRef.current = false
        return
      }

      const startTime = performance.now()
      const session: Session = {
        output,
        source,
        rafId: 0,
        startTime,
        frameIndex: 0,
        width,
        height,
        filename,
        fps,
        targetCanvas,
        targetCtx,
        webglCanvas: canvas,
        readyForMoreFrames: true,
        bitrateBps,
      }

      const captureFrame = () => {
        const s = sessionRef.current
        if (!s) return

        // Backpressure: skip frame if the encoder hasn't acked the previous
        // one yet. MediaBunny's add() promise resolves when ready.
        if (!s.readyForMoreFrames) {
          s.rafId = requestAnimationFrame(captureFrame)
          return
        }

        // Canvas may have been removed / resized — bail rather than throw.
        if (!s.webglCanvas.isConnected) {
          s.rafId = requestAnimationFrame(captureFrame)
          return
        }

        // Force the WebGL pipeline to settle before we read the buffer.
        // Without this, the compositor can occasionally hand us a stale or
        // mid-resolve GPU texture — most visible when the canvas's clear-
        // colour matches a nearby DOM background (e.g. #1A1A19, shared with
        // the page wrapper), where the optimizer is more willing to short-
        // circuit and a bright neighbouring texture bleeds in as a single-
        // frame flash.
        // Browsers return the original context type only; once a canvas was
        // created as webgl, asking for webgl2 returns null (and vice versa).
        // Try both and use whichever the canvas was created with.
        const gl =
          (s.webglCanvas.getContext('webgl2') as WebGL2RenderingContext | null) ||
          (s.webglCanvas.getContext('webgl') as WebGLRenderingContext | null)
        gl?.finish()

        // Composite the live WebGL frame into the fixed-1080p target canvas.
        // Letterbox to preserve aspect — bars are filled by clearRect since
        // the 2D context has alpha:false so "clear" is opaque black. The
        // optional color-boost filter (configured once on the context) is
        // applied automatically during drawImage.
        const fit = computeFit(s.webglCanvas.width, s.webglCanvas.height, s.width, s.height)
        s.targetCtx.clearRect(0, 0, s.width, s.height)
        s.targetCtx.drawImage(s.webglCanvas, fit.x, fit.y, fit.w, fit.h)

        // MediaBunny needs monotonic timestamps in seconds. Derive them from
        // wall-clock elapsed time (not from a frame counter), so the encoded
        // clip's duration matches how long the user actually recorded. If we
        // counted frames, a 60fps timeline encoded from a 30fps actual
        // capture would play back at 2× speed in half the duration.
        // Pattern adapted from MediaBunny's live-recording example.
        const elapsedSec = (performance.now() - s.startTime) / 1000
        const frameNum = Math.round(elapsedSec * s.fps)
        if (frameNum <= s.frameIndex) {
          // Less than 1/fps has elapsed since the previous frame — no new
          // slot to fill, just wait for the next RAF tick.
          s.rafId = requestAnimationFrame(captureFrame)
          return
        }
        const t = frameNum / s.fps
        const dur = 1 / s.fps
        s.frameIndex = frameNum

        s.readyForMoreFrames = false
        s.source.add(t, dur).then(
          () => {
            const cur = sessionRef.current
            if (cur === s) cur.readyForMoreFrames = true
          },
          (e: unknown) => {
            // Loud about silent rejections so they don't show up as
            // recordings stopping mid-capture for no visible reason.
            console.error('[recorder] mediabunny add() rejected:', e, {
              frameIndex: s.frameIndex,
              timestampSec: t,
            })
            const cur = sessionRef.current
            if (cur === s) {
              const msg =
                e instanceof Error ? e.message || e.toString() : String(e)
              setError(msg || 'Recording stopped: encoder rejected a frame.')
              void stop()
            }
          },
        )
        s.rafId = requestAnimationFrame(captureFrame)
      }

      sessionRef.current = session
      session.rafId = requestAnimationFrame(captureFrame)

      // Elapsed-time ticker, decoupled from the capture loop so the UI
      // updates even when frames are throttled. Also enforces the duration
      // cap by triggering stop() once the elapsed time crosses the limit.
      const tick = () => {
        const s = sessionRef.current
        if (!s) return
        const elapsed = performance.now() - s.startTime
        setElapsedMs(elapsed)
        if (elapsed >= maxDurationMs) {
          void stop()
          return
        }
        tickRef.current = requestAnimationFrame(tick)
      }
      tickRef.current = requestAnimationFrame(tick)

      setElapsedMs(0)
      setInfo({
        codec: 'avc',
        container: 'avc',
        width,
        height,
        bitrateMbps: Math.round(bitrateBps / 1_000_000),
      })
      setState('recording')
      startingRef.current = false
    },
    [stop],
  )

  return {
    state,
    elapsedMs,
    error,
    info,
    supported: typeof window !== 'undefined' && isSupported(),
    start,
    stop,
    /** Finalised buffer awaiting the user's download choice — popup driver. */
    pending,
    /** True while a re-encode (e.g. 30fps) is running. */
    transcoding,
    downloadRecording,
    dismissRecording,
  }
}
