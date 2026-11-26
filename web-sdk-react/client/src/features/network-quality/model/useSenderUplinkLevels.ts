import { NetworkQualityDirection } from '@livedigital/client';
import type { NetworkQualityLevel } from '@livedigital/client';
import { useEffect, useReducer } from 'react';
import { useSessionStore } from '@/entities/session';
import { parseNetworkQuality } from './quality';

export function useSenderUplinkLevels(): NetworkQualityLevel[] {
  const peers = useSessionStore((state) => state.peers);
  const [, rerender] = useReducer((revision: number) => revision + 1, 0);

  useEffect(() => {
    const senders = peers.filter(({ isMe }) => !isMe);

    senders.forEach(({ observer }) => observer.on('app-data-updated', rerender));

    return () => {
      senders.forEach(({ observer }) => observer.off('app-data-updated', rerender));
    };
  }, [peers]);

  return peers
    .filter(({ isMe }) => !isMe)
    .map(({ appData }) => parseNetworkQuality(appData.networkQuality)[NetworkQualityDirection.Uplink].level);
}
