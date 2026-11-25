import type { Peer } from '@livedigital/client';
import { useEffect, useState } from 'react';

export interface PeerAppData {
  displayName: string;
  isHandRaised: boolean;
}

const parse = (appData: Record<string, unknown>): PeerAppData => ({
  displayName: typeof appData.displayName === 'string' ? appData.displayName : '',
  isHandRaised: appData.isHandRaised === true,
});

export function usePeerAppData(peer: Peer): PeerAppData {
  const [appData, setAppData] = useState(() => parse(peer.appData));

  useEffect(() => {
    const handler = (next: Record<string, unknown>) => setAppData(parse(next));

    peer.observer.on('app-data-updated', handler);

    return () => {
      peer.observer.off('app-data-updated', handler);
    };
  }, [peer]);

  return appData;
}
