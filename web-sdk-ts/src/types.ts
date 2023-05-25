import type PeerTrack from '@livedigital/client/dist/engine/media/tracks/PeerTrack';
import { TrackLabel } from '@livedigital/client/dist/types/common';

import type Peer from './Peer';

export type PeerCallbacks = {
  onTrackStart?(track: PeerTrack): void;
  onTrackEnd?(track: PeerTrack): void;
  onTrackPaused?(track: PeerTrack): void;
  onTrackResumed?(track: PeerTrack): void;
};

export interface PublisherStoreConstructor {
  producerId: string,
  kind: 'video' | 'audio',
  label: TrackLabel,
  peer: Peer;
}
