import type { Track } from '@livedigital/client';
import { useEffect, useReducer } from 'react';
import { getSdkClient } from './client';

const TRACK_REPLACED_EVENTS = ['effects-enabled', 'effects-disabled'] as const;

export function useMediaStreamTrack(track: Track | undefined): MediaStreamTrack | undefined {
  const [, rerender] = useReducer((revision: number) => revision + 1, 0);

  useEffect(() => {
    const { observer } = getSdkClient();

    TRACK_REPLACED_EVENTS.forEach((event) => observer.on(event, rerender));

    return () => {
      TRACK_REPLACED_EVENTS.forEach((event) => observer.off(event, rerender));
    };
  }, []);

  return track?.mediaStreamTrack;
}
