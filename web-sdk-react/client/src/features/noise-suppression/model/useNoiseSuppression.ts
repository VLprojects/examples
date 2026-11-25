import type { Track } from '@livedigital/client';
import { useEffect } from 'react';
import { useNoiseSuppressionStore } from './store';

export function useNoiseSuppression(track: Track | undefined) {
  const isEnabled = useNoiseSuppressionStore((state) => state.isEnabled);
  const isInitializing = useNoiseSuppressionStore((state) => state.isInitializing);

  useEffect(() => {
    if (!track || isInitializing || !('enableNoiseSuppression' in track)) {
      return;
    }

    void (isEnabled ? track.enableNoiseSuppression() : track.disableNoiseSuppression());
  }, [track, isEnabled, isInitializing]);
}
