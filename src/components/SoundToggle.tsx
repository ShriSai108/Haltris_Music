import type { KeyboardEvent } from 'react';

interface SoundToggleProps {
  enabled: boolean;
  onEnable: () => void;
}

export function SoundToggle({ enabled, onEnable }: SoundToggleProps) {
  const enableFromKeyboard = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!enabled && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onEnable();
    }
  };

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
      onKeyDown={enableFromKeyboard}
    >
      <span aria-hidden="true">{enabled ? '◉' : '○'}</span>
      {enabled ? 'Sound enabled' : 'Enable sound'}
    </button>
  );
}
