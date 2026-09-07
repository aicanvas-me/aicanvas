// ============================================================
// DASHBOARD: Row 3 right — Activity Feed
// ============================================================

import { tokens } from '../../tokens';
import { Card } from '../../components/Card';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { activities } from './data';

type ActivityItemProps = {
  activity: (typeof activities)[number];
  isLast: boolean;
};

function ActivityItem({ activity, isLast }: ActivityItemProps) {
  return (
    <div style={{
      display: 'flex',
      gap: tokens.spacing[3],
      padding: tokens.spacing[4],
      borderBottom: isLast ? 'none' : `1px solid ${tokens.color.neutral[40]}`,
    }}>
      <Avatar name={activity.user} size="sm" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: tokens.typography.fontFamily,
          fontSize: tokens.typography.size.sm,
          color: tokens.color.neutral[80],
          lineHeight: tokens.typography.lineHeight.normal,
        }}>
          <span style={{
            fontWeight: tokens.typography.weight.semibold,
            color: tokens.color.neutral[100],
          }}>
            {activity.user}
          </span>
          {' '}
          {activity.action}
        </div>
        <div style={{
          fontFamily: tokens.typography.fontFamily,
          fontSize: tokens.typography.size.xs,
          color: tokens.color.neutral[60],
          marginTop: tokens.spacing[1],
        }}>
          {activity.time}
        </div>
      </div>
    </div>
  );
}

export function ActivityFeed() {
  return (
    <Card
      style={{ flex: 1, minWidth: 0 }}
      padding="none"
      header={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{
            fontFamily: tokens.typography.fontFamily,
            fontSize: tokens.typography.size.md,
            fontWeight: tokens.typography.weight.semibold,
            color: tokens.color.neutral[100],
          }}>
            Recent Activity
          </span>
          <Button variant="ghost" size="sm">See all</Button>
        </div>
      }
    >
      {activities.map((activity, i) => (
        <ActivityItem
          key={i}
          activity={activity}
          isLast={i === activities.length - 1}
        />
      ))}
    </Card>
  );
}
