// ============================================================
// RESOURCE PLANNING · DEMO DATA
// ============================================================

// ---- Top KPI: Cluster utilisation (a row of skewed bars) ----
// 30 segments matching the ProgressBar grid count. Values 0-1.
export const clusterUtilisation = {
  value: 87.2,
  delta: 1.4,
  segments: [
    0.62, 0.71, 0.55, 0.83, 0.92, 0.74, 0.81, 0.69, 0.78, 0.85,
    0.91, 0.66, 0.74, 0.82, 0.88, 0.94, 0.79, 0.71, 0.86, 0.91,
    0.83, 0.77, 0.89, 0.94, 0.96, 0.88, 0.81, 0.92, 0.97, 0.85,
  ],
};

// ---- Top KPI: Mission success rate (gradient progress bar) ----
export const missionSuccessRate = {
  value: 96.4,
  delta: 0.6,
};

// ---- Top KPI: Active allocations (sparkline) ----
export const activeAllocations = {
  value: 2184,
  delta: 3.5,
  series: [
    1420, 1460, 1495, 1510, 1540, 1530, 1580, 1620, 1660, 1690,
    1730, 1760, 1745, 1810, 1850, 1880, 1920, 1945, 1990, 2020,
    2055, 2080, 2110, 2095, 2130, 2155, 2168, 2180, 2184,
  ].map((v, i) => ({ t: i, v })),
};

// ---- Allocation vs usage (multi-series area chart) ----
// 31 days of mock telemetry. Allocated is the planned capacity, used is the
// active draw, reserved is the locked-but-idle pool. Generated with organic
// day-to-day variance (NOT a smooth trend — real draw is choppy): allocated
// wanders, used tracks at a varying fraction so the gap weaves open and shut,
// reserved holds roughly flat. Deterministic (no Math.random) so SSR and the
// client render identical points — a mismatch would hydrate-error.
const _fract = (x: number) => x - Math.floor(x);
const _noise = (i: number, s: number) => _fract(Math.sin((i + 1) * 12.9898 + s * 78.233) * 43758.5453); // [0,1)
const _clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export const allocationSeries = Array.from({ length: 31 }, (_, i) => {
  const trend  = 8600 + Math.sin(i / 5) * 900;       // slow rolling baseline
  const swell  = Math.sin(i / 2.3 + 1) * 700;        // mid-frequency waves
  const jitter = (_noise(i, 1) - 0.5) * 1900;        // strong day-to-day noise
  const allocated = _clamp(Math.round(trend + swell + jitter), 6200, 11400);
  const used = Math.round(allocated * (0.76 + _noise(i, 2) * 0.2)); // 76–96%, varying
  const reserved = Math.round(1480 + (_noise(i, 3) - 0.5) * 160);   // ~1400–1560
  return { t: i + 1, allocated, used, reserved };
});

// ---- Requests breakdown (3-bucket stacked) ----
export const requestsBreakdown = {
  approved: { value: '1.42K UNITS', share: 0.515 },
  pending:  { value: '802 UNITS',   share: 0.290 },
  rejected: { value: '538 UNITS',   share: 0.195 },
};

// ---- Request log table ----
export const requestRows = [
  { team: 'Comms Array',     submitted: '08/17/25', owner: 'OPS-04',  amount: '12 PFLOPS', status: 'pending'  },
  { team: 'Sensor Bay',      submitted: '08/17/25', owner: 'OPS-02',  amount: '6 PFLOPS',  status: 'pending'  },
  { team: 'Propulsion',      submitted: '08/16/25', owner: 'OPS-07',  amount: '24 PFLOPS', status: 'approved' },
  { team: 'Telemetry',       submitted: '08/16/25', owner: 'OPS-03',  amount: '8 PFLOPS',  status: 'pending'  },
  { team: 'Maintenance',     submitted: '08/16/25', owner: 'OPS-09',  amount: '4 PFLOPS',  status: 'rejected' },
  { team: 'Nav Compute',     submitted: '08/15/25', owner: 'OPS-01',  amount: '18 PFLOPS', status: 'approved' },
  { team: 'Hull Diagnostics', submitted: '08/15/25', owner: 'OPS-05', amount: '3 PFLOPS',  status: 'pending'  },
  { team: 'Life Support',    submitted: '08/14/25', owner: 'OPS-06',  amount: '7 PFLOPS',  status: 'approved' },
  { team: 'Power Grid',      submitted: '08/13/25', owner: 'OPS-08',  amount: '15 PFLOPS', status: 'approved' },
  { team: 'Comms Relay',     submitted: '08/13/25', owner: 'OPS-10',  amount: '9 PFLOPS',  status: 'approved' },
];

// Three filter tabs — All, Pending, Recent. On the narrow table panel a 4th
// tab (Approved) pushed the strip into an overflow-scroll that crowded the
// search field, so the strip now fits without scrolling and the search sits
// cleanly to its right.
export const filterTabs = [
  { id: 'all',      label: 'All',      count: 24 },
  { id: 'pending',  label: 'Pending',  count: 9  },
  { id: 'recent',   label: 'Recent',   count: 6  },
];

export const navItems = [
  'Dashboard', 'Allocations', 'Workloads', 'Capacity', 'Reports',
];
