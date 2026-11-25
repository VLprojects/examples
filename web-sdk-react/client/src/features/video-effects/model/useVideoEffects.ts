import type { Track } from '@livedigital/client';
import { useEffect, useMemo } from 'react';
import { applyVideoEffects, selectEffects, useVideoEffectsStore } from './store';

export function useVideoEffects(track: Track | undefined) {
  const background = useVideoEffectsStore((state) => state.background);
  const imageUrl = useVideoEffectsStore((state) => state.imageUrl);
  const enhancements = useVideoEffectsStore((state) => state.enhancements);
  const effects = useMemo(
    () => selectEffects({ ...useVideoEffectsStore.getState(), background, imageUrl, enhancements }),
    [background, imageUrl, enhancements],
  );

  useEffect(() => {
    if (track && 'applyEffects' in track) {
      applyVideoEffects(track, effects);
    }
  }, [track, effects]);
}
