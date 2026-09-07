// ============================================================
// SERVICE ORDER · DEMO DATA
// ============================================================

export const order = {
  id: 'SO-201923985981',
  timer: '00:55:23',
  connection: 'BER2018-2',
};

export const pageMetrics = [
  { label: 'Issues',    value: '19'  },
  { label: 'Resolved',  value: '180' },
  { label: 'Accidents', value: '02'  },
];

// ---- SLA risk panel ----
export const slaRisk = {
  value: 60,                     // gauge fill, 0–100
  title: 'Window Risk',
  description:
    'Service-level breach window for the active contract. Resolve transfers before the timer reaches zero to keep the order green.',
  used:      { value: 231, label: 'Used SLA Issues' },
  remaining: { value: 102, label: 'Remaining SLA Issues' },
};

// ---- Right-side metadata grid (3 cols × 4 rows = 12 cells) ----
// type: 'text' | 'link' | 'follow-up' (special dropdown-style cell)
export const orderMetadata = [
  // Row 1
  { label: 'Creation Date',     value: '23/12/2019',            type: 'text' },
  { label: 'Account Status',    value: 'Normal',                type: 'text' },
  { label: 'Follow up after',   value: '24:00 Hours',           type: 'follow-up' },
  // Row 2
  { label: 'Contract Name',     value: 'SUPERTEL-WE-201902737', type: 'link' },
  { label: 'Identification',    value: 'ITH0283057101',         type: 'text' },
  { label: 'Connections',       value: 'Established',           type: 'text' },
  // Row 3
  { label: 'Billing Address',   value: 'SE, Stockholm',         type: 'text' },
  { label: 'Allowance Sharing', value: 'Normal',                type: 'text' },
  { label: 'Contract Status',   value: 'Active',                type: 'text' },
  // Row 4
  { label: 'Service Type',      value: 'Voice & Data',          type: 'text' },
  { label: 'Priority Level',    value: 'Standard',              type: 'text' },
  { label: '',                  value: '',                      type: 'spacer' },
];

// ---- Items panel ----
export const itemTabs = [
  { id: 'products',  label: 'Products',  count: 7  },
  { id: 'billings',  label: 'Billings',  count: 4  },
  { id: 'inventory', label: 'Inventory', count: 12 },
  { id: 'history',   label: 'History',   count: 28 },
];

export const filterChips = ['SMS', '2017', 'DAY', 'AB', 'PDP', 'SCG', '4GSM'];

// ---- Product rows ----
export const productRows = [
  { load: 88, id: 'AB-00032734', line: '512-5719', part: 'X60 BJGJ29839281', source: 'US, Denver - 24071',       sourceLvl: 66, serviceLvl: '4/10', gmm: '59.99', total: '10.9985' },
  { load: 62, id: 'AB-00032612', line: '592-8561', part: 'X62 BAGJ28599202', source: 'US, New York - 25018',     sourceLvl: 86, serviceLvl: '6/10', gmm: '55.81', total: '7.28699' },
  { load: 22, id: 'AB-00032736', line: '612-2611', part: 'X61 BHH09027512', source: 'US, San Francisco - 27381', sourceLvl: 75, serviceLvl: '3/10', gmm: '61.01', total: '8.85221' },
  { load: 91, id: 'AB-00039925', line: '612-2231', part: 'X52 BB0372/2 X5A', source: 'US, Houston - 24027',      sourceLvl: 98, serviceLvl: '7/10', gmm: '92.99', total: '10.29701' },
  { load: 92, id: 'AB-00032751', line: '212-2656', part: 'X51 D12931/1 X1A', source: 'US, Boston - 68201',       sourceLvl: 90, serviceLvl: '8/10', gmm: '89.09', total: '9.80897' },
  { load: 43, id: 'AB-00037323', line: '662-2611', part: 'A22 D02981/2 X5B', source: 'EU, Berlin - 10752',       sourceLvl: 59, serviceLvl: '5/10', gmm: '46.52', total: '4.95601' },
  { load: 32, id: 'AB-00032002', line: '922-2611', part: 'B12 BZ9025/2 X12', source: 'EU, Sweden - 00085',       sourceLvl: 68, serviceLvl: '2/10', gmm: '69.01', total: '3.92871' },
];

// Pre-selected row index — matches the highlighted row in the reference.
export const initiallySelected = ['AB-00032736'];

export const navItems = ['Orders', 'Customers', 'Inventory', 'Reports', 'Settings'];
