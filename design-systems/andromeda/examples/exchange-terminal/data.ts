// ============================================================
// EXCHANGE TERMINAL — sample data
// All numbers are static and deterministic so the screenshot stays
// reproducible. Candles modeled after a multi-month BTC/USDT run-up
// ending at ~$19,200, mirroring the reference snapshot.
// ============================================================

// ─── Candles ────────────────────────────────────────────────────────────────
// 120 daily candles with realistic wave structure and varied wick patterns.
// Waypoints define 3 Elliott-style waves + corrections so the chart reads
// as a genuine bull run rather than a straight drift.
//
// Candle pattern mix:
//   marubozu    — big body, no wicks        (strong momentum)
//   hammer      — small body, long lower wick (reversal bottom)
//   shootingStar— small body, long upper wick (reversal top)
//   doji        — tiny body, balanced wicks  (indecision)
//   longWick    — normal body + one extreme wick (intraday rejection)
//   normal      — standard OHLC             (most candles)
export const candles = (() => {
  const out = [];

  // Deterministic LCG — same output on every render.
  let seed = 0x4a7f;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return ((seed >>> 8) & 0xffff) / 0xffff;
  };
  const rng = (lo: number, hi: number) => lo + rand() * (hi - lo);

  // ── Waypoints (index → target close price) ──────────────────────────
  // Three up-waves with corrections compressed into 30 candles.
  const WP = [
    [0,   36.50],
    [12,  54.20],  // wave 1 peak
    [18,  42.80],  // correction 1 low
    [32,  69.40],  // wave 2 peak
    [40,  56.20],  // correction 2 low
    [50,  81.30],  // wave 3 peak
    [56,  77.20],  // correction 3 low
    [59,  84.15],  // final push — current price
  ];

  // Linear interpolation of target price between waypoints.
  function targetAt(i: number) {
    for (let k = 0; k < WP.length - 1; k++) {
      const [i0, p0] = WP[k];
      const [i1, p1] = WP[k + 1];
      if (i >= i0 && i <= i1) {
        return p0 + (p1 - p0) * ((i - i0) / (i1 - i0));
      }
    }
    return WP[WP.length - 1][1];
  }

  // Determine dominant trend direction at candle i (up / down).
  function trendDir(i: number) {
    for (let k = 0; k < WP.length - 1; k++) {
      if (i >= WP[k][0] && i < WP[k + 1][0]) {
        return WP[k + 1][1] > WP[k][1] ? 1 : -1;
      }
    }
    return 1;
  }

  let price = 36.50;

  for (let i = 0; i < 60; i++) {
    const target = targetAt(i);
    const dir = trendDir(i);

    // Pull price toward target with velocity noise — creates the wavy feel.
    const pull = (target - price) * rng(0.12, 0.28);
    const noise = rng(-1.0, 1.0);
    const o = price;
    const rawC = o + pull + noise;
    const c = Math.max(20, rawC);

    const bodyHi = Math.max(o, c);
    const bodyLo = Math.min(o, c);
    const bodySize = Math.max(bodyHi - bodyLo, 0.22); // minimum visible body

    // ── Pattern selection ──────────────────────────────────────────────
    // Bias toward hammer near wave bottoms, shootingStar near peaks,
    // marubozu during strong trend legs, doji during indecision.
    const nearBottom = (i >= 16 && i <= 20) || (i >= 38 && i <= 42) || (i >= 54 && i <= 58);
    const nearTop    = (i >= 10 && i <= 14) || (i >= 30 && i <= 34) || (i >= 48 && i <= 52);
    const strongTrend = Math.abs(pull) > 0.55;

    let h, l;
    const r = rand();

    if (nearBottom && r < 0.45) {
      // Hammer: long lower wick (2–4× body), tiny or no upper wick.
      const lowerWick = bodySize * rng(2.0, 4.0);
      const upperWick = bodySize * rng(0, 0.25);
      h = bodyHi + upperWick;
      l = bodyLo - lowerWick;

    } else if (nearTop && r < 0.45) {
      // Shooting star: long upper wick (2–4× body), tiny lower wick.
      const upperWick = bodySize * rng(2.0, 4.0);
      const lowerWick = bodySize * rng(0, 0.25);
      h = bodyHi + upperWick;
      l = bodyLo - lowerWick;

    } else if (strongTrend && r < 0.30) {
      // Marubozu: virtually no wicks — pure momentum candle.
      h = bodyHi + rng(0, 0.11);
      l = bodyLo - rng(0, 0.11);

    } else if (r < 0.12) {
      // Doji: tiny body, long balanced wicks (indecision).
      const wickLen = rng(0.75, 1.85);
      h = bodyHi + wickLen * rng(0.4, 0.7);
      l = bodyLo - wickLen * rng(0.4, 0.7);

    } else if (r < 0.22) {
      // Long upper wick only — buyers rejected at the high.
      h = bodyHi + bodySize * rng(1.5, 3.5);
      l = bodyLo - bodySize * rng(0.1, 0.4);

    } else if (r < 0.32) {
      // Long lower wick only — sellers rejected at the low.
      h = bodyHi + bodySize * rng(0.1, 0.4);
      l = bodyLo - bodySize * rng(1.5, 3.5);

    } else {
      // Normal: moderate wicks on both sides.
      h = bodyHi + bodySize * rng(0.1, 0.8);
      l = bodyLo - bodySize * rng(0.1, 0.8);
    }

    // Guard: h ≥ max(o,c) and l ≤ min(o,c).
    h = Math.max(h, bodyHi);
    l = Math.min(l, bodyLo);

    // Volume in SOL units — bodySize coefficient bumped (×5500) so the
    // coupling between body size and volume reads visually like before.
    const v = Math.round(9000 + bodySize * 5500 + rng(0, 14000));

    // 60 candles across November + December (30 each).
    const month = i < 30 ? '11' : '12';
    const day = ((i % 30) + 1).toString().padStart(2, '0');

    out.push({
      t: `${month}/${day}`,
      o: round(o), h: round(h), l: round(l), c: round(c),
      v,
    });
    price = c;
  }
  return out;
})();

function round(n: number) { return Math.round(n * 100) / 100; }

// Convenience: the "last" candle drives the header readouts.
export const last = candles[candles.length - 1];

// ─── Header stats ───────────────────────────────────────────────────────────
export const pair = {
  base: 'SOL',
  quote: 'USDT',
  leverage: '10x',
  longName: 'Solana',
  price: 84.15,
  priceUsd: 84.15,
  change24h: 0.73,
  changePct24h: 0.87,
  high24h: 85.12,
  low24h: 82.46,
  volBase24h: 1842736.42,    // ≈1.84 M SOL traded
  volQuote24h: 154946821.55, // ≈$155 M USDT volume
};

// Latest "tape" tick — used for the bottom price ribbon.
export const tape = {
  price: 84.15,
  priceUsd: 84.15,
};

// ─── Order book ─────────────────────────────────────────────────────────────
// Two arrays so consumers can render asks (descending) above bids (descending).
// Numbers chosen to match the screenshot at the centerline.
// Asks (above the centerline) — descending price toward the spot.
// Amounts are in SOL; total = price × amount.
export const asks = [
  { p: 84.21, a:  6.082, t:    512.13 },
  { p: 84.20, a: 78.985, t:   6648.60 },
  { p: 84.19, a:  1.256, t:    105.74 },
  { p: 84.18, a: 13.703, t:   1153.55 },
  { p: 84.17, a: 158.143, t: 13310.10 },
  { p: 84.17, a:  2.053, t:    172.80 },
  { p: 84.16, a: 539.766, t: 45427.70 },
  { p: 84.16, a: 633.476, t: 53309.31 },
];

export const bids = [
  { p: 84.15, a:  7.835, t:    659.31 },
  { p: 84.14, a:  1.256, t:    105.68 },
  { p: 84.13, a: 20.683, t:   1739.86 },
  { p: 84.12, a: 28.197, t:   2371.65 },
  { p: 84.11, a: 114.226, t:  9607.25 },
  { p: 84.10, a:  1.256, t:    105.63 },
  { p: 84.09, a: 234.072, t: 19684.91 },
  { p: 84.08, a: 491.183, t: 41303.39 },
];

// ─── Pair list (right column) ───────────────────────────────────────────────
// Mirrors the BTC quote tab in the snapshot.
export const pairs = [
  { sym: 'AAVE',   lev: '5x',  last: 0.004700,    chg:  2.71 },
  { sym: 'ADA',    lev: '10x', last: 0.00000808,  chg: -0.86 },
  { sym: 'ADX',    lev: null,  last: 0.00001510,  chg: -0.53 },
  { sym: 'AE',     lev: null,  last: 0.00000804,  chg: -4.06 },
  { sym: 'AERGO',  lev: null,  last: 0.00000230,  chg:  1.32 },
  { sym: 'AGI',    lev: null,  last: 0.00000259,  chg: -5.13 },
  { sym: 'AION',   lev: null,  last: 0.00000413,  chg: -0.48 },
  { sym: 'AKRO',   lev: null,  last: 0.00000070,  chg:  0.00 },
  { sym: 'ALGO',   lev: '5x',  last: 0.00001723,  chg: -2.77 },
  { sym: 'ALPHA',  lev: '3x',  last: 0.00001294,  chg:  0.08 },
  { sym: 'AMB',    lev: null,  last: 0.00000069,  chg: -2.82 },
  { sym: 'ANKR',   lev: '5x',  last: 0.00000048,  chg:  2.13 },
];

// ─── Market trades (right column, lower) ────────────────────────────────────
// SOL prices oscillate around the spot 84.15 with realistic order sizes.
export const trades = [
  { p: 84.15, a:   3.270, t: '14:32:08', side: 'sell' },
  { p: 84.16, a:  18.745, t: '14:32:07', side: 'buy'  },
  { p: 84.16, a:   1.170, t: '14:32:07', side: 'buy'  },
  { p: 84.15, a:  28.207, t: '14:32:06', side: 'sell' },
  { p: 84.16, a:   9.371, t: '14:32:06', side: 'buy'  },
  { p: 84.15, a: 114.286, t: '14:32:05', side: 'sell' },
  { p: 84.16, a:   2.560, t: '14:32:05', side: 'buy'  },
  { p: 84.14, a:   0.894, t: '14:32:04', side: 'sell' },
  { p: 84.16, a:   5.142, t: '14:32:04', side: 'buy'  },
  { p: 84.15, a:  17.625, t: '14:32:03', side: 'sell' },
  { p: 84.15, a:   1.404, t: '14:32:02', side: 'sell' },
  { p: 84.16, a:  50.039, t: '14:32:02', side: 'buy'  },
];

// ─── Moving averages ────────────────────────────────────────────────────────
// Used both inside the chart polylines and the legend readout.
export function movingAverage(period: number) {
  const out = [];
  for (let i = 0; i < candles.length; i++) {
    if (i < period - 1) { out.push(null); continue; }
    let sum = 0;
    for (let k = i - period + 1; k <= i; k++) sum += candles[k].c;
    out.push(round(sum / period));
  }
  return out;
}

export const maSeries = {
  5:  movingAverage(5),
  10: movingAverage(10),
  20: movingAverage(20),
};
