import { useCallback, useEffect, useRef, useState } from 'react';

interface AmbientAudio {
  context: AudioContext;
  gain: GainNode;
  oscillator: OscillatorNode;
}

interface AudioWindow extends Window {
  webkitAudioContext?: typeof AudioContext;
}

export function useAmbientSound() {
  const audioRef = useRef<AmbientAudio | null>(null);
  const [enabled, setEnabled] = useState(false);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      setEnabled(false);
      return;
    }

    audioRef.current = null;
    audio.oscillator.stop();
    audio.oscillator.disconnect();
    audio.gain.disconnect();
    void audio.context.close().catch(() => undefined);
    setEnabled(false);
  }, []);

  const toggle = useCallback(() => {
    if (audioRef.current) {
      stop();
      return;
    }

    const AudioContextConstructor = window.AudioContext ?? (window as AudioWindow).webkitAudioContext;
    if (!AudioContextConstructor) {
      return;
    }

    const context = new AudioContextConstructor();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = 55;
    gain.gain.value = 0.006;
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    audioRef.current = { context, gain, oscillator };
    setEnabled(true);
    void context.resume().catch(() => undefined);
  }, [stop]);

  useEffect(() => stop, [stop]);

  return { enabled, toggle };
}
