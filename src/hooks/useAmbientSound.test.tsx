import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useAmbientSound } from './useAmbientSound';

function AmbientSoundHarness() {
  const { enabled, toggle } = useAmbientSound();

  return (
    <button type="button" aria-pressed={enabled} onClick={toggle}>
      {enabled ? 'Disable sound' : 'Enable sound'}
    </button>
  );
}

function mockAudioContext() {
  const oscillator = {
    connect: vi.fn(),
    disconnect: vi.fn(),
    frequency: { value: 0 },
    start: vi.fn(),
    stop: vi.fn(),
    type: 'sine' as OscillatorType,
  };
  const gain = {
    connect: vi.fn(),
    disconnect: vi.fn(),
    gain: { value: 1 },
  };
  const context = {
    close: vi.fn().mockResolvedValue(undefined),
    createGain: vi.fn(() => gain),
    createOscillator: vi.fn(() => oscillator),
    destination: {},
    resume: vi.fn().mockResolvedValue(undefined),
  };
  const AudioContext = vi.fn(class AudioContextMock {
    constructor() {
      return context;
    }
  });

  Object.defineProperty(window, 'AudioContext', { configurable: true, value: AudioContext });

  return { AudioContext, context, gain, oscillator };
}

afterEach(() => {
  vi.restoreAllMocks();
  delete (window as Window & { AudioContext?: unknown }).AudioContext;
});

it('starts a very quiet ambient layer only after the user enables it, then stops it when disabled', () => {
  const { AudioContext, context, gain, oscillator } = mockAudioContext();

  render(<AmbientSoundHarness />);

  expect(AudioContext).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: /enable sound/i }));

  expect(AudioContext).toHaveBeenCalledOnce();
  expect(oscillator.start).toHaveBeenCalledOnce();
  expect(gain.gain.value).toBeLessThan(0.01);
  expect(screen.getByRole('button', { name: /disable sound/i })).toHaveAttribute('aria-pressed', 'true');

  fireEvent.click(screen.getByRole('button', { name: /disable sound/i }));

  expect(oscillator.stop).toHaveBeenCalledOnce();
  expect(oscillator.disconnect).toHaveBeenCalledOnce();
  expect(gain.disconnect).toHaveBeenCalledOnce();
  expect(context.close).toHaveBeenCalledOnce();
  expect(screen.getByRole('button', { name: /enable sound/i })).toHaveAttribute('aria-pressed', 'false');
});

it('cleans up active audio nodes and the audio context on unmount', () => {
  const { context, gain, oscillator } = mockAudioContext();
  const { unmount } = render(<AmbientSoundHarness />);

  fireEvent.click(screen.getByRole('button', { name: /enable sound/i }));
  unmount();

  expect(oscillator.stop).toHaveBeenCalledOnce();
  expect(oscillator.disconnect).toHaveBeenCalledOnce();
  expect(gain.disconnect).toHaveBeenCalledOnce();
  expect(context.close).toHaveBeenCalledOnce();
});
