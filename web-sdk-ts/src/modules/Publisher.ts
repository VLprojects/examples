import { TrackLabel } from '@livedigital/client/dist/types/common';
import { PublisherStoreConstructor } from 'types';
import type Peer from './Peer';

class Publisher {
  public readonly producerId: string;

  public readonly kind: 'video' | 'audio';

  public readonly label: TrackLabel;

  public isSubscribed = false;

  private readonly participantPeer: Peer;

  private isSubscriptionInProgress = false;

  constructor({
    producerId,
    kind,
    label,
    peer,
  }: PublisherStoreConstructor) {
    this.participantPeer = peer;
    this.kind = kind;
    this.label = label;
    this.producerId = producerId;
  }

  async subscribe(): Promise<void> {
    if (this.participantPeer.isMe || this.isSubscribed || this.isSubscriptionInProgress) {
      return;
    }

    try {
      this.isSubscriptionInProgress = true;
      await this.participantPeer.peer.subscribe({
        producerId: this.producerId,
        muted: true,
      });
      this.isSubscribed = true;
    } catch (error) {
      console.error('Error subscribe media', {
        error,
        case: 'subscribe',
        participantPeer: this.participantPeer,
        producerId: this.producerId,
        trackLabel: this.label,
      });
    } finally {
      this.isSubscriptionInProgress = false;
    }
  }
}

export default Publisher