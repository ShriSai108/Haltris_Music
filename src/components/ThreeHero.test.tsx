import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as THREE from 'three';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SoundToggle } from './SoundToggle';
import { ThreeHero } from './ThreeHero';

const threeTestMocks = vi.hoisted(() => ({ renderer: null as object | null, shouldThrow: false }));

vi.mock('three', async (importOriginal) => {
  const actual = await importOriginal<typeof import('three')>();
  return {
    ...actual,
    WebGLRenderer: vi.fn(class WebGLRendererMock {
      constructor() {
        if (threeTestMocks.shouldThrow) {
          throw new Error('WebGL unavailable');
        }
        return threeTestMocks.renderer as object;
      }
    }),
  };
});

const heroProps = {
  eyebrow: 'Haltris Music',
  title: 'Sound for the after-hours.',
  description: 'Independent music, carefully amplified.',
};

function setReducedMotion(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)' && matches,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

function setLegacyReducedMotion(matches: boolean) {
  const addListener = vi.fn();
  const removeListener = vi.fn();
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockReturnValue({
      matches,
      media: '(prefers-reduced-motion: reduce)',
      addEventListener: undefined,
      removeEventListener: undefined,
      addListener,
      removeListener,
      dispatchEvent: vi.fn(),
    }),
  });

  return { addListener, removeListener };
}

function enableWebGL() {
  Object.defineProperty(window, 'WebGLRenderingContext', {
    configurable: true,
    value: class WebGLRenderingContextMock {},
  });
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => ({}) as never);
}

function setDocumentHidden(hidden: boolean) {
  Object.defineProperty(document, 'hidden', {
    configurable: true,
    value: hidden,
  });
}

function mockAnimationFrames() {
  let nextFrameId = 0;
  const callbacks = new Map<number, FrameRequestCallback>();
  const requestAnimationFrame = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    const frameId = ++nextFrameId;
    callbacks.set(frameId, callback);
    return frameId;
  });
  const cancelAnimationFrame = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((frameId) => {
    callbacks.delete(frameId);
  });

  return { callbacks, requestAnimationFrame, cancelAnimationFrame };
}

function mockRenderer() {
  const renderer = {
    dispose: vi.fn(),
    render: vi.fn(),
    setPixelRatio: vi.fn(),
    setSize: vi.fn(),
  } as unknown as THREE.WebGLRenderer;
  const constructor = vi.mocked(THREE.WebGLRenderer);
  threeTestMocks.renderer = renderer;

  return { renderer, constructor };
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
  vi.resetAllMocks();
  threeTestMocks.renderer = null;
  threeTestMocks.shouldThrow = false;
  delete (window as Window & { WebGLRenderingContext?: unknown }).WebGLRenderingContext;
  delete (window as Window & { AudioContext?: unknown }).AudioContext;
  setDocumentHidden(false);
});

describe('ThreeHero', () => {
  beforeEach(() => {
    setReducedMotion(false);
  });

  it('renders its copy and leaves sound disabled on initial render', () => {
    render(
      <ThreeHero {...heroProps} />,
    );

    expect(screen.getByRole('heading', { name: 'Sound for the after-hours.' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enable sound/i })).toHaveAttribute('aria-pressed', 'false');
    expect(document.querySelector('audio')).not.toBeInTheDocument();
  });

  it('uses a non-animated fallback when reduced motion is preferred', () => {
    setReducedMotion(true);

    const { container } = render(
      <ThreeHero {...heroProps} />,
    );

    expect(container.querySelector('.three-hero__scene--fallback')).toBeInTheDocument();
    expect(container.querySelector('canvas')).not.toBeInTheDocument();
  });

  it('uses legacy reduced-motion media query listeners when needed', () => {
    const { addListener, removeListener } = setLegacyReducedMotion(false);
    const { unmount } = render(<ThreeHero {...heroProps} />);

    expect(addListener).toHaveBeenCalledWith(expect.any(Function));
    unmount();
    expect(removeListener).toHaveBeenCalledWith(expect.any(Function));
  });

  it('pauses the pending frame while hidden and schedules one frame when visible again', async () => {
    enableWebGL();
    const { renderer } = mockRenderer();
    const { callbacks, requestAnimationFrame, cancelAnimationFrame } = mockAnimationFrames();
    const { unmount } = render(<ThreeHero {...heroProps} />);

    expect(renderer).toBeDefined();
    expect(vi.mocked(THREE.WebGLRenderer)).toHaveBeenCalledOnce();
    expect(document.hidden).toBe(false);
    await waitFor(() => expect(requestAnimationFrame).toHaveBeenCalledOnce());
    const initialFrame = callbacks.get(1);
    expect(initialFrame).toBeDefined();

    setDocumentHidden(true);
    document.dispatchEvent(new Event('visibilitychange'));
    expect(cancelAnimationFrame).toHaveBeenCalledWith(1);
    initialFrame?.(0);
    expect(requestAnimationFrame).toHaveBeenCalledOnce();

    setDocumentHidden(false);
    document.dispatchEvent(new Event('visibilitychange'));
    expect(requestAnimationFrame).toHaveBeenCalledTimes(2);

    document.dispatchEvent(new Event('visibilitychange'));
    expect(requestAnimationFrame).toHaveBeenCalledTimes(2);

    unmount();
  });

  it('caps the renderer pixel ratio and disposes the renderer on unmount', async () => {
    enableWebGL();
    Object.defineProperty(window, 'devicePixelRatio', { configurable: true, value: 3 });
    const { renderer } = mockRenderer();
    const { cancelAnimationFrame } = mockAnimationFrames();

    const { unmount } = render(<ThreeHero {...heroProps} />);

    await waitFor(() => expect(renderer.setPixelRatio).toHaveBeenCalledWith(1.5));
    unmount();
    expect(cancelAnimationFrame).toHaveBeenCalledOnce();
    expect(renderer.dispose).toHaveBeenCalledOnce();
  });

  it('renders the fallback when WebGL renderer construction fails', async () => {
    enableWebGL();
    const constructor = vi.mocked(THREE.WebGLRenderer);
    threeTestMocks.shouldThrow = true;

    const { container } = render(<ThreeHero {...heroProps} />);

    await waitFor(() => {
      expect(container.querySelector('.three-hero__scene--fallback')).toBeInTheDocument();
    });
    expect(constructor).toHaveBeenCalledOnce();
    expect(container.querySelector('canvas')).not.toBeInTheDocument();
  });

  it('enables and disables ambient sound through the hero toggle', () => {
    const { AudioContext, context, gain, oscillator } = mockAudioContext();

    render(<ThreeHero {...heroProps} />);

    fireEvent.click(screen.getByRole('button', { name: /enable sound/i }));
    expect(AudioContext).toHaveBeenCalledOnce();
    expect(oscillator.start).toHaveBeenCalledOnce();
    expect(gain.gain.value).toBeLessThan(0.01);

    fireEvent.click(screen.getByRole('button', { name: /disable sound/i }));
    expect(oscillator.stop).toHaveBeenCalledOnce();
    expect(context.close).toHaveBeenCalledOnce();
  });

  it('cleans up ambient sound when the hero unmounts', () => {
    const { context, gain, oscillator } = mockAudioContext();
    const { unmount } = render(<ThreeHero {...heroProps} />);

    fireEvent.click(screen.getByRole('button', { name: /enable sound/i }));
    unmount();

    expect(oscillator.stop).toHaveBeenCalledOnce();
    expect(oscillator.disconnect).toHaveBeenCalledOnce();
    expect(gain.disconnect).toHaveBeenCalledOnce();
    expect(context.close).toHaveBeenCalledOnce();
  });
});

describe('SoundToggle', () => {
  it('uses one native click activation for keyboard-triggered clicks and supports disabling', () => {
    const onToggle = vi.fn();

    const { rerender } = render(<SoundToggle enabled={false} onToggle={onToggle} />);

    const button = screen.getByRole('button', { name: /enable sound/i });
    expect(onToggle).not.toHaveBeenCalled();

    fireEvent.keyDown(button, { key: 'Enter' });
    fireEvent.click(button);
    expect(onToggle).toHaveBeenCalledOnce();

    rerender(<SoundToggle enabled onToggle={onToggle} />);
    fireEvent.click(screen.getByRole('button', { name: /disable sound/i }));
    expect(onToggle).toHaveBeenCalledTimes(2);
  });
});
