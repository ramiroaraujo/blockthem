interface ToggleSwitchProps {
  enabled: boolean;
  onClick: () => void;
  size?: 'sm' | 'md';
}

export function ToggleSwitch({
  enabled,
  onClick,
  size = 'md',
}: ToggleSwitchProps) {
  const isSmall = size === 'sm';
  return (
    <div
      onClick={onClick}
      className={`relative shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${
        isSmall ? 'h-5 w-9' : 'h-[22px] w-10'
      } ${enabled ? 'bg-primary' : 'bg-border'}`}
    >
      <div
        className={`absolute top-0.5 rounded-full transition-[left] duration-200 ${
          isSmall ? 'h-4 w-4' : 'h-[18px] w-[18px]'
        } ${
          enabled
            ? `bg-white ${isSmall ? 'left-[18px]' : 'left-5'}`
            : `bg-text-muted ${isSmall ? 'left-0.5' : 'left-0.5'}`
        }`}
      />
    </div>
  );
}
