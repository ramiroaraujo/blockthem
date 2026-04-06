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
        marginBottom: 32,
        fontSize: 18,
        fontWeight: 'bold',
        color: 'var(--color-primary)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        🛡️ BlockThem
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

      <div style={{ padding: '0 20px' }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 13,
          color: 'var(--color-text-secondary)',
          cursor: 'pointer',
        }}>
          <div
            onClick={onToggleBlocking}
            style={{
              width: 40,
              height: 22,
              borderRadius: 11,
              background: blockingEnabled ? 'var(--color-primary)' : 'var(--color-border)',
              position: 'relative',
              transition: 'background 0.2s',
            }}
          >
            <div style={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: 'white',
              position: 'absolute',
              top: 2,
              left: blockingEnabled ? 20 : 2,
              transition: 'left 0.2s',
            }} />
          </div>
          Blocking {blockingEnabled ? 'ON' : 'OFF'}
        </label>
      </div>
    </div>
  )
}
