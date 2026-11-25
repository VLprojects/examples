import type { PeerTrack } from '@livedigital/client';
import { useEffect, useState } from 'react';

export function useTrackVolume(track: PeerTrack | undefined): number {
  const [volume, setVolume] = useState(0);

  useEffect(() => {
    if (!track) {
      return;
    }

    const handler = ({ value }: { value: number }) => setVolume(value);

    track.observer.on('volume-changed', handler);

    return () => {
      track.observer.off('volume-changed', handler);
      setVolume(0);
    };
  }, [track]);

  return volume;
}
