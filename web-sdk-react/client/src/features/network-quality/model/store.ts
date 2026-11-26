import type { Client, NetworkQuality } from '@livedigital/client';
import { create } from 'zustand';
import { useSessionStore } from '@/entities/session';
import { createUnknownQuality } from './quality';

interface NetworkQualityState {
  quality: NetworkQuality;
}

export const useNetworkQualityStore = create<NetworkQualityState>(() => ({ quality: createUnknownQuality() }));

const toShared = (quality: NetworkQuality) => Object.fromEntries(
  Object.entries(quality).map(([direction, { level, reasons }]) => [direction, { level, reasons }]),
);

let lastPublished = '';

const publish = (quality: NetworkQuality) => {
  const { status, updateAppData } = useSessionStore.getState();
  const shared = toShared(quality);
  const signature = JSON.stringify(shared);

  if (status === 'connected' && signature !== lastPublished) {
    lastPublished = signature;
    updateAppData({ networkQuality: shared }).catch(() => undefined);
  }
};

export const bindNetworkQualityEvents = (client: Client) => {
  client.observer.on('network-quality-updated', (quality) => {
    useNetworkQualityStore.setState({ quality });
    publish(quality);
  });

  useSessionStore.subscribe(({ status }, previous) => {
    if (status === previous.status) {
      return;
    }

    useNetworkQualityStore.setState({ quality: status === 'connected' ? client.networkQuality() : createUnknownQuality() });
    lastPublished = '';
  });
};
