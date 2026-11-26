import type { Peer, Track } from '@livedigital/client';
import { showToast } from '@/shared/ui';

const findTrack = (peer: Peer, label: string) => [...peer.tracks.values()].find((track) => track.label === label);

const run = (operation: Promise<void> | undefined) => {
  operation?.catch(() => showToast('dev.track.actionFailed', { tone: 'error' }));
};

export const requestKeyFrame = (peer: Peer, label: string) => run(findTrack(peer, label)?.requestKeyFrame());

export const toggleReceiving = (peer: Peer, label: string) => {
  const track = findTrack(peer, label);

  run(track?.isPaused ? track.resume() : track?.pause());
};

export const requestLayers = (peer: Peer, label: string, spatialLayer: number, temporalLayer: number) => (
  run(findTrack(peer, label)?.requestVideoPreferredLayers({ spatialLayer, temporalLayer }))
);

export const setMaxSpatialLayer = (track: Track | undefined, spatialLayer: number) => {
  if (track && 'setMaxSpatialLayer' in track) {
    run(track.setMaxSpatialLayer(spatialLayer));
  }
};
