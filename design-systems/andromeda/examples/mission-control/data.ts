// @ts-nocheck — design-systems/ is not type-checked (see design-systems/CLAUDE.md). Strip this after a proper typing pass.
// ============================================================
// MISSION CONTROL DEMO DATA
// ============================================================

import {
  SquaresFour,
  Pulse,
  Rocket,
  Radio,
  Warning,
  Wrench,
} from '@phosphor-icons/react';

// ---- Sidebar nav ----
export const navItems = [
  { id: 'overview',    label: 'Overview',    icon: SquaresFour },
  { id: 'telemetry',   label: 'Telemetry',   icon: Pulse       },
  { id: 'vehicles',    label: 'Vehicles',    icon: Rocket      },
  { id: 'comms',       label: 'Comms',       icon: Radio       },
  { id: 'anomalies',   label: 'Anomalies',   icon: Warning     },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench      },
];

// ---- Telemetry stat tiles ----
export const telemetryStats = [
  { code: 'TLM-01', label: 'Altitude', value: '412.4', unit: 'KM',   delta: 0.3,   deltaLabel: 'last 60s' },
  { code: 'TLM-02', label: 'Velocity', value: '7.66',  unit: 'KM/S', delta: -0.02, deltaLabel: 'last 60s' },
  { code: 'TLM-03', label: 'Signal',   value: '98',    unit: '%',    delta: 0,     deltaLabel: 'nominal'  },
  { code: 'TLM-04', label: 'Power',    value: '87',    unit: '%',    delta: -2,    deltaLabel: 'last 1h'  },
];

// ---- Altitude chart (24 hours, sampled hourly) ----
export const altitudeData = [
  { t: '00:00', alt: 396 },
  { t: '01:00', alt: 398 },
  { t: '02:00', alt: 401 },
  { t: '03:00', alt: 400 },
  { t: '04:00', alt: 403 },
  { t: '05:00', alt: 405 },
  { t: '06:00', alt: 404 },
  { t: '07:00', alt: 406 },
  { t: '08:00', alt: 408 },
  { t: '09:00', alt: 407 },
  { t: '10:00', alt: 409 },
  { t: '11:00', alt: 410 },
  { t: '12:00', alt: 408 },
  { t: '13:00', alt: 411 },
  { t: '14:00', alt: 409 },
  { t: '15:00', alt: 412 },
  { t: '16:00', alt: 410 },
  { t: '17:00', alt: 413 },
  { t: '18:00', alt: 411 },
  { t: '19:00', alt: 414 },
  { t: '20:00', alt: 412 },
  { t: '21:00', alt: 411 },
  { t: '22:00', alt: 412 },
  { t: '23:00', alt: 412 },
];

// ---- System status panel ----
export const systems = [
  { name: 'Propulsion',   status: 'nominal', value: 98  },
  { name: 'Navigation',   status: 'nominal', value: 100 },
  { name: 'Comms Array',  status: 'caution', value: 76  },
  { name: 'Power Grid',   status: 'nominal', value: 87  },
  { name: 'Thermal',      status: 'fault',   value: 92  },
  { name: 'Life Support', status: 'nominal', value: 100 },
];

// ---- Vehicles table ----
export const vehicles = [
  { callsign: 'ARES-1',     type: 'Probe',     status: 'active',  distance: '412 km',  lastContact: '12s ago' },
  { callsign: 'OBERON',     type: 'Lander',    status: 'standby', distance: '0.4 AU',  lastContact: '4m ago'  },
  { callsign: 'KEPLER-2',   type: 'Telescope', status: 'active',  distance: '1.5 AU',  lastContact: '32s ago' },
  { callsign: 'VOYAGER-X',  type: 'Probe',     status: 'caution', distance: '18.2 AU', lastContact: '6h ago'  },
  { callsign: 'HORIZON',    type: 'Orbiter',   status: 'active',  distance: '220 km',  lastContact: '8s ago'  },
];

export const vehicleStatusLabel = {
  active:  'Active',
  standby: 'Standby',
  caution: 'Caution',
  fault:   'Fault',
};

// ---- Comms log ----
export const commsLog = [
  { dir: 'down',  from: 'ARES-1',    text: 'Telemetry packet received',     time: 'T-12s' },
  { dir: 'up',    from: 'OBERON',    text: 'Command queue updated',          time: 'T-1m'  },
  { dir: 'down',  from: 'KEPLER-2',  text: 'Image batch transmitted',        time: 'T-3m'  },
  { dir: 'alert', from: 'VOYAGER-X', text: 'Signal degraded · investigate',  time: 'T-32m' },
  { dir: 'down',  from: 'HORIZON',   text: 'Orbit correction confirmed',     time: 'T-1h'  },
  { dir: 'down',  from: 'ARES-1',    text: 'Battery cycle complete',         time: 'T-1h 12m' },
  { dir: 'up',    from: 'KEPLER-2',  text: 'Sensor calibration sent',        time: 'T-2h'  },
  { dir: 'down',  from: 'HORIZON',   text: 'Hand-off to ground accepted',    time: 'T-2h 18m' },
  { dir: 'alert', from: 'OBERON',    text: 'Heat shield within 12% of limit',time: 'T-3h'  },
  { dir: 'down',  from: 'KEPLER-2',  text: 'Imaging window closed',          time: 'T-4h'  },
  { dir: 'up',    from: 'ARES-1',    text: 'Override accepted by flight',    time: 'T-5h'  },
  { dir: 'down',  from: 'VOYAGER-X', text: 'Heartbeat — partial frame',      time: 'T-5h 40m' },
];

// ---- Telemetry: 24h time-series (sampled hourly to match altitudeData) ----
const TIMESTAMPS_24H = [
  '00:00','01:00','02:00','03:00','04:00','05:00','06:00','07:00',
  '08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00',
  '16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00',
];
function series(values: number[]) {
  return TIMESTAMPS_24H.map((t, i) => ({ t, v: values[i] }));
}
export const velocityData = series([
  7.62, 7.63, 7.64, 7.64, 7.65, 7.65, 7.66, 7.66,
  7.66, 7.67, 7.66, 7.66, 7.65, 7.65, 7.66, 7.66,
  7.67, 7.67, 7.66, 7.66, 7.65, 7.66, 7.66, 7.66,
]);
export const powerData = series([
  92, 92, 91, 91, 90, 90, 89, 89,
  88, 88, 87, 87, 87, 87, 86, 87,
  88, 88, 88, 87, 87, 87, 87, 87,
]);
export const signalData = series([
  98, 98, 98, 99, 99, 98, 98, 98,
  97, 98, 98, 98, 99, 98, 96, 92,
  88, 96, 98, 98, 98, 98, 98, 98,
]);

// ---- Vehicles · enriched for the Vehicles section grid ----
// Each vehicle gets a placeholder thumbnail (Unsplash space/satellite imagery)
// + a one-line mission summary. Images are referenced by URL — Andromeda
// doesn't ship an Image primitive yet; flagged as a candidate when this
// section reveals broader need.
export const vehiclesDetailed = [
  {
    callsign: 'ARES-1',
    type: 'Probe',
    status: 'active',
    distance: '412 km',
    lastContact: '12s ago',
    mission: 'Low-orbit reconnaissance',
    image: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=640&auto=format&fit=crop',
    crew: 0,
    fuel: 84,
  },
  {
    callsign: 'OBERON',
    type: 'Lander',
    status: 'standby',
    distance: '0.4 AU',
    lastContact: '4m ago',
    mission: 'Awaiting descent window',
    image: 'https://images.unsplash.com/photo-1454789548928-9efd52dc4031?w=640&auto=format&fit=crop',
    crew: 4,
    fuel: 92,
  },
  {
    callsign: 'KEPLER-2',
    type: 'Telescope',
    status: 'active',
    distance: '1.5 AU',
    lastContact: '32s ago',
    mission: 'Deep-sky imaging cycle',
    image: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=640&auto=format&fit=crop',
    crew: 0,
    fuel: 71,
  },
  {
    callsign: 'VOYAGER-X',
    type: 'Probe',
    status: 'caution',
    distance: '18.2 AU',
    lastContact: '6h ago',
    mission: 'Heliopause traversal',
    image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=640&auto=format&fit=crop',
    crew: 0,
    fuel: 22,
  },
  {
    callsign: 'HORIZON',
    type: 'Orbiter',
    status: 'active',
    distance: '220 km',
    lastContact: '8s ago',
    mission: 'Equatorial mapping pass',
    image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=640&auto=format&fit=crop',
    crew: 0,
    fuel: 67,
  },
  {
    callsign: 'TITAN-9',
    type: 'Lander',
    status: 'fault',
    distance: '1.4 AU',
    lastContact: '14h ago',
    mission: 'Surface operations · paused',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=640&auto=format&fit=crop',
    crew: 0,
    fuel: 8,
  },
];

// ---- Anomalies ----
export const anomalies = [
  {
    id: 'ANM-2041',
    severity: 'fault',
    source: 'TITAN-9',
    title: 'Descent thruster non-responsive',
    detail: 'Thruster bank A-2 stopped reporting telemetry at T-14h 02m.',
    time: 'T-14h',
    status: 'open',
  },
  {
    id: 'ANM-2039',
    severity: 'warning',
    source: 'OBERON',
    title: 'Heat shield within 12% of operational limit',
    detail: 'Trending toward limit over last 3 hours; ground-team review queued.',
    time: 'T-3h',
    status: 'open',
  },
  {
    id: 'ANM-2037',
    severity: 'warning',
    source: 'VOYAGER-X',
    title: 'Signal degraded',
    detail: 'Frame loss above 4%. Investigating deep-space array calibration.',
    time: 'T-32m',
    status: 'investigating',
  },
  {
    id: 'ANM-2032',
    severity: 'info',
    source: 'ARES-1',
    title: 'Battery cycle complete',
    detail: 'Cycle 412 finished within nominal envelope.',
    time: 'T-1h 12m',
    status: 'resolved',
  },
  {
    id: 'ANM-2028',
    severity: 'info',
    source: 'HORIZON',
    title: 'Hand-off accepted',
    detail: 'Ground network 4 accepted hand-off; previous station released.',
    time: 'T-2h 18m',
    status: 'resolved',
  },
];

// ---- Maintenance ----
export const maintenance = [
  {
    id: 'MNT-118',
    target: 'KEPLER-2',
    task: 'Optics recalibration',
    window: 'T+ 02h 00m → T+ 02h 45m',
    duration: '45m',
    state: 'scheduled',
  },
  {
    id: 'MNT-117',
    target: 'ARES-1',
    task: 'Antenna realignment',
    window: 'T+ 06h 00m → T+ 06h 30m',
    duration: '30m',
    state: 'scheduled',
  },
  {
    id: 'MNT-115',
    target: 'OBERON',
    task: 'Heat shield diagnostic',
    window: 'In progress',
    duration: 'Live',
    state: 'in-progress',
  },
  {
    id: 'MNT-112',
    target: 'HORIZON',
    task: 'Reaction-wheel test',
    window: 'T- 04h 12m → T- 03h 38m',
    duration: '34m',
    state: 'completed',
  },
  {
    id: 'MNT-110',
    target: 'TITAN-9',
    task: 'Descent thruster check',
    window: 'T- 14h',
    duration: 'Aborted',
    state: 'failed',
  },
];

// ---- Notifications ----
export const notifications = [
  {
    id: 'NTF-9821',
    title: 'Daily briefing ready',
    detail: '24h summary, anomalies, and recommended actions.',
    time: 'T+ 00:08',
    read: false,
  },
  {
    id: 'NTF-9820',
    title: 'TITAN-9 paged on-call',
    detail: 'Anomaly ANM-2041 escalated to flight director.',
    time: 'T- 00:32',
    read: false,
  },
  {
    id: 'NTF-9819',
    title: 'OBERON descent window opens in 2h',
    detail: 'Pre-flight checklist gates ready for review.',
    time: 'T- 01:14',
    read: false,
  },
  {
    id: 'NTF-9818',
    title: 'VOYAGER-X frame loss alert',
    detail: 'Investigating; deep-space array calibration in progress.',
    time: 'T- 02:00',
    read: true,
  },
  {
    id: 'NTF-9817',
    title: 'KEPLER-2 imaging cycle complete',
    detail: 'Batch transmitted, archive ID #41098.',
    time: 'T- 03:25',
    read: true,
  },
  {
    id: 'NTF-9816',
    title: 'HORIZON hand-off accepted',
    detail: 'Ground network 4 owns the link.',
    time: 'T- 05:40',
    read: true,
  },
];
