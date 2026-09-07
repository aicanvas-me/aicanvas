// ============================================================
// DASHBOARD: Row 3 left — Projects Table
// ============================================================

import { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { tokens } from '../../tokens';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Avatar } from '../../components/Avatar';
import { ProgressBar } from '../../components/ProgressBar';
import { Button } from '../../components/Button';
import { projects, statusBadgeVariant, statusBadgeLabel } from './data';

type ProjectRowProps = {
  project: (typeof projects)[number];
  isLast: boolean;
};

function ProjectRow({ project, isLast }: ProjectRowProps) {
  const [hovered, setHovered] = useState(false);
  const [menuHovered, setMenuHovered] = useState(false);

  const progressVariant =
    project.progress >= 80 ? 'success' :
    project.progress >= 50 ? 'primary' : 'warning';

  return (
    <tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? tokens.color.neutral[20] : tokens.color.neutral[0],
        transition: 'background 0.1s ease',
        borderBottom: isLast ? 'none' : `1px solid ${tokens.color.neutral[40]}`,
      }}
    >
      {/* Project name */}
      <td style={{ padding: `${tokens.spacing[3]} ${tokens.spacing[4]}` }}>
        <span style={{
          fontFamily: tokens.typography.fontFamily,
          fontSize: tokens.typography.size.md,
          fontWeight: tokens.typography.weight.medium,
          color: tokens.color.neutral[100],
        }}>
          {project.name}
        </span>
      </td>
      {/* Status badge */}
      <td style={{ padding: `${tokens.spacing[3]} ${tokens.spacing[4]}` }}>
        <Badge variant={statusBadgeVariant[project.status]}>
          {statusBadgeLabel[project.status]}
        </Badge>
      </td>
      {/* Owner */}
      <td style={{ padding: `${tokens.spacing[3]} ${tokens.spacing[4]}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
          <Avatar name={project.owner} size="sm" />
          <span style={{
            fontFamily: tokens.typography.fontFamily,
            fontSize: tokens.typography.size.sm,
            color: tokens.color.neutral[80],
          }}>
            {project.owner}
          </span>
        </div>
      </td>
      {/* Progress */}
      <td style={{ padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`, minWidth: '120px' }}>
        <ProgressBar value={project.progress} colorVariant={progressVariant} />
      </td>
      {/* Due date */}
      <td style={{ padding: `${tokens.spacing[3]} ${tokens.spacing[4]}` }}>
        <span style={{
          fontFamily: tokens.typography.fontFamily,
          fontSize: tokens.typography.size.sm,
          color: tokens.color.neutral[70],
        }}>
          {project.due}
        </span>
      </td>
      {/* Actions menu */}
      <td style={{ padding: `${tokens.spacing[2]} ${tokens.spacing[3]}` }}>
        <button
          onMouseEnter={() => setMenuHovered(true)}
          onMouseLeave={() => setMenuHovered(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: menuHovered ? tokens.color.neutral[40] : 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: tokens.color.neutral[70],
            padding: tokens.spacing[1],
            borderRadius: tokens.radius.md,
            transition: 'background 0.1s ease',
          }}
        >
          <MoreHorizontal size={15} />
        </button>
      </td>
    </tr>
  );
}

export function ProjectsTable() {
  return (
    <Card
      style={{ flex: '0 0 calc(65% - 8px)', minWidth: 0 }}
      padding="none"
      header={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{
            fontFamily: tokens.typography.fontFamily,
            fontSize: tokens.typography.size.md,
            fontWeight: tokens.typography.weight.semibold,
            color: tokens.color.neutral[100],
          }}>
            Projects
          </span>
          <Button variant="subtle" size="sm">View all</Button>
        </div>
      }
    >
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontFamily: tokens.typography.fontFamily,
      }}>
        <thead>
          <tr style={{ background: tokens.color.neutral[20] }}>
            {['Project', 'Status', 'Owner', 'Progress', 'Due', ''].map((col, i) => (
              <th
                key={i}
                style={{
                  padding: col === ''
                    ? `${tokens.spacing[2]} ${tokens.spacing[3]}`
                    : `${tokens.spacing[2]} ${tokens.spacing[4]}`,
                  textAlign: 'left',
                  fontFamily: tokens.typography.fontFamily,
                  fontSize: tokens.typography.size.xs,
                  fontWeight: tokens.typography.weight.semibold,
                  color: tokens.color.neutral[70],
                  borderBottom: `1px solid ${tokens.color.neutral[40]}`,
                  letterSpacing: '0.4px',
                  textTransform: 'uppercase',
                  width: col === '' ? '40px' : undefined,
                }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {projects.map((project, i) => (
            <ProjectRow
              key={project.name}
              project={project}
              isLast={i === projects.length - 1}
            />
          ))}
        </tbody>
      </table>
    </Card>
  );
}
