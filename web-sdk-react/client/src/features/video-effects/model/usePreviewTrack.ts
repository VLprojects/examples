import type { VideoTrack } from '@livedigital/client';
import { useEffect, useState } from 'react';
import { selectTrackConstraints } from '@/entities/device';
import { getSdkClient } from '@/shared/sdk';
import { useVideoEffectsStore } from './store';

export function usePreviewTrack(isEnabled: boolean): VideoTrack | undefined {
  const [track, setTrack] = useState<VideoTrack>();

  useEffect(() => {
    if (!isEnabled) {
      return undefined;
    }

    const client = getSdkClient();
    const creating = client.createCameraVideoTrack({ video: selectTrackConstraints('camera'), isPreview: true });

    creating.then(setTrack).catch(() => useVideoEffectsStore.setState({ status: 'failed' }));

    return () => {
      void creating.then((created) => client.deleteTrack(created)).catch(() => undefined);
    };
  }, [isEnabled]);

  return isEnabled && track?.mediaStreamTrack.readyState === 'live' ? track : undefined;
}
