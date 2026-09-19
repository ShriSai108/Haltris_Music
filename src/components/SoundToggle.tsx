interface SoundToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

export function SoundToggle({ enabled, onToggle }: SoundToggleProps) {
  return (
    <button
      className="sound-toggle"
      type="button"
      aria-pressed={enabled}
      onClick={onToggle}
    >
      <span aria-hidden="true">{enabled ? '◉' : '○'}</span>
      {enabled ? 'Disable sound' : 'Enable sound'}
    </button>
  );
}
