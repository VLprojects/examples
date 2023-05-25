import type PeerTrack from '@livedigital/client/dist/engine/media/tracks/PeerTrack';
import { TrackLabel } from '@livedigital/client/dist/types/common';

import type Peer from './Peer';

class MediaTrack {
  private readonly peer: Peer;

  private readonly peerTrack: PeerTrack;

  private paused = false;

  constructor(peer: Peer, peerTrack: PeerTrack) {
    this.peer = peer;
    this.peerTrack = peerTrack;
  }

  setIsPaused(value: boolean): void {
    this.paused = value;
  }

  get label(): TrackLabel {
    return this.peerTrack.label;
  }

  get isPaused(): boolean {
    return this.paused;
  }
}

export default MediaTrack;