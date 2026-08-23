// JSON-RPC client over stdio for the built server, shared by the smoke and
// offline tests. The registry base is only overridden when one is passed, so
// the production smoke test keeps the server's default.

import { spawn } from 'node:child_process'

const SERVER = new URL('../dist/index.js', import.meta.url).pathname

export class McpClient {
  constructor({ registryBase, extraEnv = {}, timeoutMs = 15000 } = {}) {
    const env = { ...process.env, ...extraEnv }
    if (registryBase) env.AICANVAS_REGISTRY_BASE = registryBase
    this.proc = spawn('node', [SERVER], { stdio: ['pipe', 'pipe', 'pipe'], env })
    this.timeoutMs = timeoutMs
    this.buf = ''
    this.pending = new Map()
    this.nextId = 1
    this.stderr = ''

    this.proc.stdout.setEncoding('utf-8')
    this.proc.stdout.on('data', (chunk) => {
      this.buf += chunk
      let nl
      while ((nl = this.buf.indexOf('\n')) !== -1) {
        const line = this.buf.slice(0, nl).trim()
        this.buf = this.buf.slice(nl + 1)
        if (!line) continue
        try {
          const msg = JSON.parse(line)
          if (msg.id != null && this.pending.has(msg.id)) {
            const { resolve } = this.pending.get(msg.id)
            this.pending.delete(msg.id)
            resolve(msg)
          }
        } catch {
          this.stderr += `[parse-error] ${line}\n`
        }
      }
    })
    this.proc.stderr.setEncoding('utf-8')
    this.proc.stderr.on('data', (chunk) => {
      this.stderr += chunk
    })
  }

  request(method, params) {
    const id = this.nextId++
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id)
        reject(new Error(`timeout: ${method}`))
      }, this.timeoutMs)
      this.pending.set(id, {
        resolve: (m) => {
          clearTimeout(timer)
          resolve(m)
        },
      })
      this.proc.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n')
    })
  }

  notify(method, params) {
    this.proc.stdin.write(JSON.stringify({ jsonrpc: '2.0', method, params }) + '\n')
  }

  async close() {
    this.proc.stdin.end()
    await new Promise((r) => this.proc.once('exit', r))
  }

  isAlive() {
    return this.proc.exitCode == null
  }
}
