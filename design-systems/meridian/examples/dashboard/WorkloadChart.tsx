// ============================================================
// DASHBOARD: Row 2 right — Team Workload BarChart
// ============================================================

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { tokens } from '../../tokens';
import { Card } from '../../components/Card';
import { workloadData } from './data';

export function WorkloadChart() {
  return (
    <Card
      style={{ flex: 1, minWidth: 0 }}
      header={
        <div>
          <div style={{
            fontFamily: tokens.typography.fontFamily,
            fontSize: tokens.typography.size.md,
            fontWeight: tokens.typography.weight.semibold,
            color: tokens.color.neutral[100],
          }}>
            Team Workload
          </div>
          <div style={{
            fontFamily: tokens.typography.fontFamily,
            fontSize: tokens.typography.size.sm,
            color: tokens.color.neutral[70],
            marginTop: '2px',
          }}>
            Current sprint capacity
          </div>
        </div>
      }
    >
      <div style={{ height: '224px' }}>
        {/* Fixed height (matches the wrapper): a known height stops recharts
            warning "width(-1) and height(-1)" on its first pre-measure render. */}
        <ResponsiveContainer width="100%" height={224}>
          <BarChart
            data={workloadData}
            layout="vertical"
            margin={{ top: tokens.radius.px.xl, right: tokens.radius.px.xl, left: tokens.radius.px.xl, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={tokens.color.neutral[40]}
              horizontal={false}
            />
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{
                fontFamily: tokens.typography.fontFamily,
                fontSize: parseInt(tokens.typography.size.sm, 10),
                fill: tokens.color.neutral[70],
              }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `${v}%`}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{
                fontFamily: tokens.typography.fontFamily,
                fontSize: parseInt(tokens.typography.size.sm, 10),
                fill: tokens.color.neutral[70],
              }}
              axisLine={false}
              tickLine={false}
              width={68}
            />
            <Tooltip
              formatter={v => [`${v}%`, 'Load']}
              contentStyle={{
                fontFamily: tokens.typography.fontFamily,
                fontSize: tokens.typography.size.sm,
                borderRadius: tokens.radius.lg,
                border: `1px solid ${tokens.color.neutral[50]}`,
                boxShadow: tokens.shadow[4],
              }}
            />
            <Bar
              dataKey="load"
              radius={[0, tokens.radius.px.md, tokens.radius.px.md, 0]}
              maxBarSize={20}
            >
              {workloadData.map((entry, index) => (
                <Cell key={index} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
