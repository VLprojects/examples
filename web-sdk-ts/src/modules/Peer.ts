/* eslint-disable max-classes-per-file */
import type PeerTrack from '@livedigital/client/dist/engine/media/tracks/PeerTrack';
import type ClientPeer from '@livedigital/client/dist/engine/Peer';
import { TrackLabel, PayloadOfPublishedMedia, PayloadOfUnpublishedMedia } from '@livedigital/client/dist/types/common';
import { PeerCallbacks } from './types';
import Publisher from './Publisher';
import MediaTrack from './MediaTrack';

class Peer {
  mediaTracks = new Map<string, MediaTrack>();

  publishers = new Map<string, Publisher>();

  readonly peer: ClientPeer;

  readonly callbacks: PeerCallbacks;

  constructor(peer: ClientPeer, callbacks: PeerCallbacks) {
    this.peer = peer;
    this.callbacks = callbacks;
    this.listenPeerEvents();
    this.loadPublishers();
  }

  get isMe(): boolean {
    return this.peer.isMe;
  }

  private loadPublishers(): void {
    this.peer.publishedMedia.forEach((payload) => {
      if (this.publishers.has(payload.label)) {
        return;
      }

      const publisher = new Publisher({ ...payload, peer: this });
      this.publishers.set(publisher.label, publisher);
      publisher.subscribe();
    });
  }

  private listenPeerEvents(): void {
    this.peer.observer.on('media-published', (payload: PayloadOfPublishedMedia) => {
      const publisher = new Publisher({ ...payload, peer: this });
      this.publishers.set(publisher.label, publisher);
      publisher.subscribe();
    });

    this.peer.observer.on('media-unpublished', (payload: PayloadOfUnpublishedMedia) => {
      this.publishers.delete(payload.label);
    });

    this.peer.observer.on('track-start', (track: PeerTrack) => {
      const mediaTrack = new MediaTrack(this, track);
      this.setMediaTrack(mediaTrack);
      this.callbacks.onTrackStart?.(track, this);
    });

    this.peer.observer.on('track-end', (track: PeerTrack) => {
      this.removeMediaTrack(track.label);
      this.callbacks.onTrackEnd?.(track, this);
    });

    this.peer.observer.on('track-paused', (track: PeerTrack) => {
      this.mediaTracks.get(track.label)?.setIsPaused(true);
      this.callbacks.onTrackPaused?.(track, this);
    });

    this.peer.observer.on('track-resumed', (track: PeerTrack) => {
      this.mediaTracks.get(track.label)?.setIsPaused(false);
      this.callbacks.onTrackResumed?.(track, this);
    });
  }

  setMediaTrack(mediaTrack: MediaTrack): void {
    this.mediaTracks.set(mediaTrack.label, mediaTrack);
  }

  removeMediaTrack(label: TrackLabel): void {
    this.mediaTracks.delete(label);
  }
}

export default Peer;
