interface SoundToggleProps {
  enabled: boolean;
  onEnable: () => void;
}

export function SoundToggle({ enabled, onEnable }: SoundToggleProps) {
  return (
    <button
      className="sound-toggle"
      type="button"
      aria-pressed={enabled}
      onClick={() => {
        if (!enabled) {
          onEnable();
        }
      }}
    >
      <span aria-hidden="true">{enabled ? '◉' : '○'}</span>
      {enabled ? 'Sound enabled' : 'Enable sound'}
    </button>
  );
}
