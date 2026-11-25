import type { Peer } from '@livedigital/client';
import { useEffect, useState } from 'react';

const readDisplayName = (appData: Record<string, unknown>) => (
  typeof appData.displayName === 'string' ? appData.displayName : ''
);

export function usePeerDisplayName(peer: Peer): string {
  const [displayName, setDisplayName] = useState(() => readDisplayName(peer.appData));

  useEffect(() => {
    const handler = (appData: Record<string, unknown>) => setDisplayName(readDisplayName(appData));

    peer.observer.on('app-data-updated', handler);

    return () => {
      peer.observer.off('app-data-updated', handler);
    };
  }, [peer]);

  return displayName;
}
