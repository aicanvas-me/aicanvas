// ============================================================
// DASHBOARD: Row 2 left — Sprint Velocity AreaChart
// ============================================================

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { TooltipContentProps } from 'recharts';
import { tokens } from '../../tokens';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { velocityData } from './data';

function VelocityTooltip({ active, payload, label }: Partial<TooltipContentProps>) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: tokens.color.neutral[0],
      border: `1px solid ${tokens.color.neutral[50]}`,
      borderRadius: tokens.radius.lg,
      padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
      boxShadow: tokens.shadow[4],
      fontFamily: tokens.typography.fontFamily,
    }}>
      <div style={{
        fontSize: tokens.typography.size.xs,
        color: tokens.color.neutral[70],
        marginBottom: tokens.spacing[1],
        fontWeight: tokens.typography.weight.medium,
      }}>
        {label}
      </div>
      {payload.map((p, i) => (
        <div key={i} style={{
          fontSize: tokens.typography.size.md,
          fontWeight: tokens.typography.weight.semibold,
          color: p.dataKey === 'velocity' ? tokens.color.primary[50] : tokens.color.neutral[70],
        }}>
          {p.dataKey === 'velocity' ? 'Velocity' : 'Target'}: {p.value} pts
        </div>
      ))}
    </div>
  );
}

export function VelocityChart() {
  return (
    <Card
      style={{ flex: '0 0 calc(60% - 8px)', minWidth: 0 }}
      header={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{
              fontFamily: tokens.typography.fontFamily,
              fontSize: tokens.typography.size.md,
              fontWeight: tokens.typography.weight.semibold,
              color: tokens.color.neutral[100],
            }}>
              Sprint Velocity
            </div>
            <div style={{
              fontFamily: tokens.typography.fontFamily,
              fontSize: tokens.typography.size.sm,
              color: tokens.color.neutral[70],
              marginTop: '2px',
            }}>
              Last 6 months · story points delivered
            </div>
          </div>
          <Badge variant="info">Live</Badge>
        </div>
      }
    >
      <div style={{ height: '224px' }}>
        {/* Fixed height (matches the wrapper): a known height stops recharts
            warning "width(-1) and height(-1)" on its first pre-measure render. */}
        <ResponsiveContainer width="100%" height={224}>
          <AreaChart
            data={velocityData}
            margin={{ top: tokens.radius.px.xl, right: tokens.radius.px.xl, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="velocityFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={tokens.color.primary[50]} stopOpacity={0.18} />
                <stop offset="95%" stopColor={tokens.color.primary[50]} stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={tokens.color.neutral[40]}
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{
                fontFamily: tokens.typography.fontFamily,
                fontSize: parseInt(tokens.typography.size.sm, 10),
                fill: tokens.color.neutral[70],
              }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{
                fontFamily: tokens.typography.fontFamily,
                fontSize: parseInt(tokens.typography.size.sm, 10),
                fill: tokens.color.neutral[70],
              }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<VelocityTooltip />} />
            <Area
              type="monotone"
              dataKey="velocity"
              name="Velocity"
              stroke={tokens.color.primary[50]}
              strokeWidth={2}
              fill="url(#velocityFill)"
              dot={{ fill: tokens.color.primary[50], r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: tokens.color.primary[50] }}
            />
            <Area
              type="monotone"
              dataKey="target"
              name="Target"
              stroke={tokens.color.neutral[60]}
              strokeWidth={1.5}
              strokeDasharray="5 4"
              fill="none"
              dot={false}
              activeDot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
