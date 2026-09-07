// ============================================================
// DASHBOARD: Header
// ============================================================

import { useState } from 'react';
import { Bell, Search } from 'lucide-react';
import { tokens } from '../../tokens';
import { Input } from '../../components/Input';
import { Avatar } from '../../components/Avatar';

export type HeaderProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
};

export function Header({ searchValue, onSearchChange }: HeaderProps) {
  const [notifHovered, setNotifHovered] = useState(false);

  return (
    <header style={{
      height: tokens.layout.headerHeight,
      flexShrink: 0,
      background: tokens.color.neutral[0],
      borderBottom: `1px solid ${tokens.color.neutral[50]}`,
      display: 'flex',
      alignItems: 'center',
      padding: `0 ${tokens.spacing[6]}`,
      gap: tokens.spacing[4],
    }}>
      {/* Page title */}
      <h1 style={{
        margin: 0,
        fontFamily: tokens.typography.fontFamily,
        fontSize: tokens.typography.size.lg,
        fontWeight: tokens.typography.weight.semibold,
        color: tokens.color.neutral[100],
        flexShrink: 0,
      }}>
        Overview
      </h1>

      {/* Search — centered */}
      <div style={{ flex: 1, maxWidth: '360px', margin: '0 auto' }}>
        <Input
          placeholder="Search projects, people…"
          icon={Search}
          value={searchValue}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>

      {/* Right controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacing[2],
        marginLeft: 'auto',
      }}>
        {/* Notification bell */}
        <button
          onMouseEnter={() => setNotifHovered(true)}
          onMouseLeave={() => setNotifHovered(false)}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '34px',
            height: '34px',
            borderRadius: tokens.radius.md,
            border: 'none',
            background: notifHovered ? tokens.color.neutral[30] : 'transparent',
            cursor: 'pointer',
            color: tokens.color.neutral[80],
            transition: 'background 0.1s ease',
            flexShrink: 0,
          }}
        >
          <Bell size={17} />
          {/* Notification dot */}
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: tokens.color.error[50],
            border: `2px solid ${tokens.color.neutral[0]}`,
          }} />
        </button>

        <Avatar name="Alex Kim" size="md" />
      </div>
    </header>
  );
}
