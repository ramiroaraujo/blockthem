interface SidebarProps {
  activePage: string
  onNavigate: (page: string) => void
  blockingEnabled: boolean
  onToggleBlocking: () => void
}

const NAV_ITEMS = [
  { id: 'blocklist', label: 'Block List', icon: '🚫' },
  { id: 'schedule', label: 'Schedule', icon: '🕐' },
  { id: 'password', label: 'Password', icon: '🔒' },
]

export function Sidebar({
  activePage,
  onNavigate,
  blockingEnabled,
  onToggleBlocking,
}: SidebarProps) {
  return (
    <div style={{
      width: 220,
      background: 'var(--color-sidebar)',
      borderRight: '1px solid var(--color-border)',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 0',
      flexShrink: 0,
    }}>
      <div style={{
        padding: '0 20px',
        marginBottom: 16,
        fontSize: 18,
        fontWeight: 'bold',
        color: 'var(--color-primary)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        🛡️ BlockThem
      </div>

      {/* Blocking toggle — right below the title */}
      <div style={{ padding: '0 20px', marginBottom: 24 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            background: 'var(--color-surface)',
            borderRadius: 8,
            fontSize: 12,
            color: 'var(--color-text-secondary)',
          }}
        >
          <span>Blocking {blockingEnabled ? 'ON' : 'OFF'}</span>
          <div
            onClick={onToggleBlocking}
            style={{
              width: 36,
              height: 20,
              borderRadius: 10,
              background: blockingEnabled ? 'var(--color-primary)' : 'var(--color-border)',
              position: 'relative',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            <div style={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: blockingEnabled ? 'white' : '#666',
              position: 'absolute',
              top: 2,
              left: blockingEnabled ? 18 : 2,
              transition: 'left 0.2s',
            }} />
          </div>
        </div>
      </div>

      <nav style={{ flex: 1 }}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              width: '100%',
              padding: '10px 20px',
              border: 'none',
              background: activePage === item.id ? 'var(--color-primary)' : 'transparent',
              color: activePage === item.id ? 'white' : 'var(--color-text-secondary)',
              fontSize: 14,
              textAlign: 'left',
              borderRadius: 0,
            }}
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
