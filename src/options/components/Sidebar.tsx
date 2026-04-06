import { ToggleSwitch } from '../../shared/components/ToggleSwitch';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  blockingEnabled: boolean;
  onToggleBlocking: () => void;
}

const NAV_ITEMS = [
  { id: 'blocklist', label: 'Block List', icon: '🚫' },
  { id: 'schedule', label: 'Schedule', icon: '🕐' },
  { id: 'password', label: 'Password', icon: '🔒' },
];

export function Sidebar({
  activePage,
  onNavigate,
  blockingEnabled,
  onToggleBlocking,
}: SidebarProps) {
  return (
    <div className="flex w-[220px] shrink-0 flex-col border-r border-border bg-sidebar py-5">
      <div className="mb-4 flex items-center gap-2 px-5 text-lg font-bold text-primary">
        <img src="/icons/icon-48.png" alt="" className="h-6 w-6" />
        BlockThem
      </div>

      {/* Blocking toggle */}
      <div className="mb-6 px-5">
        <div className="flex items-center justify-between rounded-lg bg-surface p-2 px-3 text-xs text-text-secondary">
          <span>Blocking {blockingEnabled ? 'ON' : 'OFF'}</span>
          <ToggleSwitch
            enabled={blockingEnabled}
            onClick={onToggleBlocking}
            size="sm"
          />
        </div>
      </div>

      <nav className="flex-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex w-full items-center gap-2.5 border-none px-5 py-2.5 text-left text-sm ${
              activePage === item.id
                ? 'bg-primary text-white'
                : 'bg-transparent text-text-secondary'
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
