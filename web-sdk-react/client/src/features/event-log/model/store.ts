import type { Client, Peer } from '@livedigital/client';
import { create } from 'zustand';
import { useSessionStore } from '@/entities/session';
import { simplifyPayload } from './serialize';

const CLIENT_EVENTS = [
  'channel-event',
  'peer-joined',
  'peer-left',
  'channel-activity-confirmation-required',
  'channel-activity-confirmation-acquired',
  'channel-activity-confirmation-expired',
  'channel-rejoin-required',
  'channel-state-inconsistent',
  'channel-state-synced',
  'devices-list-updated',
  'transport-connection-timeout',
  'track-force-closed',
  'track-failed',
  'active-speaker-changed',
  'connection-lost',
  'connection-restored',
  'forced-disconnect',
  'reject-unauthorized',
  'denoiser-initializing',
  'denoiser-enabled',
  'denoiser-disabled',
  'denoiser-fallback',
  'denoiser-failed',
  'effects-enabled',
  'effects-disabled',
  'effects-failed',
  'network-scores-updated',
  'network-quality-updated',
] as const;

const PEER_EVENTS = [
  'media-published',
  'media-unpublished',
  'publisher-paused',
  'publisher-resumed',
  'connection-quality-changed',
  'track-start',
  'track-end',
  'track-paused',
  'track-resumed',
  'track-failed',
  'app-data-updated',
  'produce-permissions-changed',
  'groups-changed',
] as const;

export const FREQUENT_EVENTS: string[] = ['network-scores-updated', 'active-speaker-changed'];

const MAX_ENTRIES = 300;

export interface EventLogEntry {
  id: number;
  time: number;
  source: string;
  name: string;
  payload: unknown;
}

interface EventLogState {
  entries: EventLogEntry[];
  clear: () => void;
}

export const useEventLogStore = create<EventLogState>((set) => ({
  entries: [],
  clear: () => set({ entries: [] }),
}));

let nextId = 1;

const record = (source: string, name: string, args: unknown[]) => {
  const entry = { id: nextId, time: Date.now(), source, name, payload: simplifyPayload(args) };

  nextId += 1;
  useEventLogStore.setState(({ entries }) => ({ entries: [entry, ...entries].slice(0, MAX_ENTRIES) }));
};

const watchedPeers = new WeakSet<Peer>();

const watchPeer = (peer: Peer) => {
  if (watchedPeers.has(peer)) {
    return;
  }

  watchedPeers.add(peer);

  const source = peer.isMe ? 'me' : `peer ${peer.id.slice(0, 6)}`;

  PEER_EVENTS.forEach((name) => {
    (peer.observer as { on: (event: string, listener: (...args: unknown[]) => void) => void })
      .on(name, (...args) => record(source, name, args));
  });
};

export const bindEventLog = (client: Client) => {
  CLIENT_EVENTS.forEach((name) => {
    client.observer.on(name, (...args: unknown[]) => record('client', name, args));
  });

  useSessionStore.subscribe(({ peers, status }, previous) => {
    peers.forEach(watchPeer);

    if (status !== previous.status) {
      record('app', `session-${status}`, []);
    }
  });
};
