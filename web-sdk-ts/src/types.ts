import type PeerTrack from '@livedigital/client/dist/engine/media/tracks/PeerTrack';
import { TrackLabel } from '@livedigital/client/dist/types/common';

import type Peer from './modules/Peer';

export type PeerCallbacks = {
  onTrackStart?(track: PeerTrack, peer: Peer): void;
  onTrackEnd?(track: PeerTrack, peer: Peer): void;
  onTrackPaused?(track: PeerTrack, peer: Peer): void;
  onTrackResumed?(track: PeerTrack, peer: Peer): void;
};

export interface PublisherStoreConstructor {
  producerId: string,
  kind: 'video' | 'audio',
  label: TrackLabel,
  peer: Peer;
}
