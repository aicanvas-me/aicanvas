// ============================================================
// MERIDIAN DEMO DATA
// ============================================================

import {
  LayoutDashboard,
  FolderOpen,
  Users,
  BarChart2,
  Settings,
} from 'lucide-react';
import { tokens } from '../../tokens';

// ---- Charts ----
export const velocityData = [
  { month: 'Nov', velocity: 62, target: 70 },
  { month: 'Dec', velocity: 71, target: 72 },
  { month: 'Jan', velocity: 68, target: 74 },
  { month: 'Feb', velocity: 79, target: 76 },
  { month: 'Mar', velocity: 85, target: 78 },
  { month: 'Apr', velocity: 87, target: 80 },
];

export const workloadData = [
  { name: 'Alex K.',   load: 92, fill: tokens.color.error[50]   },
  { name: 'Jamie L.',  load: 75, fill: tokens.color.warning[50] },
  { name: 'Sam R.',    load: 58, fill: tokens.color.primary[50] },
  { name: 'Morgan T.', load: 44, fill: tokens.color.success[50] },
];

// ---- Projects table ----
export const projects = [
  { name: 'Meridian Design System', status: 'active',  owner: 'Alex Kim',  progress: 78, due: 'Apr 30' },
  { name: 'API Gateway v3',          status: 'warning', owner: 'Jamie Lee', progress: 45, due: 'Apr 15' },
  { name: 'Mobile App Rewrite',      status: 'active',  owner: 'Sam Reyes', progress: 92, due: 'May 10' },
  { name: 'Data Pipeline',           status: 'info',    owner: 'Morgan T.', progress: 60, due: 'Apr 22' },
  { name: 'Auth Service',            status: 'error',   owner: 'Alex Kim',  progress: 30, due: 'Apr 12' },
] as const;

export const statusBadgeVariant = {
  active:  'success',
  warning: 'warning',
  error:   'error',
  info:    'info',
} as const;

export const statusBadgeLabel = {
  active:  'Active',
  warning: 'At Risk',
  error:   'Blocked',
  info:    'In Review',
} as const;

// ---- Activity feed ----
export const activities = [
  { user: 'Alex Kim',  action: 'pushed 3 commits to main branch',         time: '2m ago'  },
  { user: 'Jamie Lee', action: 'opened PR #142: API rate limiting',        time: '18m ago' },
  { user: 'Sam Reyes', action: 'closed issue #87: Login redirect loop',    time: '1h ago'  },
  { user: 'Morgan T.', action: 'commented on the data schema proposal',    time: '3h ago'  },
  { user: 'Alex Kim',  action: 'merged PR #139: Auth middleware update',   time: '5h ago'  },
];

// ---- Sidebar navigation ----
export const navItems = [
  { icon: LayoutDashboard, label: 'Overview',  id: 'overview'  },
  { icon: FolderOpen,      label: 'Projects',  id: 'projects'  },
  { icon: Users,           label: 'Team',      id: 'team'      },
  { icon: BarChart2,       label: 'Analytics', id: 'analytics' },
  { icon: Settings,        label: 'Settings',  id: 'settings'  },
];
