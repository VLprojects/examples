import type { Track } from '@livedigital/client';
import { useEffect, useMemo } from 'react';
import { applyVideoEffects, selectEffects, useVideoEffectsStore } from './store';
import type { VideoEffectsSettings } from './store';

export function useVideoEffects(track: Track | undefined, settings: VideoEffectsSettings) {
  const attempt = useVideoEffectsStore((state) => state.attempt);
  const effects = useMemo(() => selectEffects(settings), [settings]);

  useEffect(() => {
    if (track && 'applyEffects' in track) {
      applyVideoEffects(track, effects);
    }
  }, [track, effects, attempt]);
}
