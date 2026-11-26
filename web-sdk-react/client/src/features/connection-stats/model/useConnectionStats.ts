import type { ClientMetaPayload, TransportsWebRTCStats } from '@livedigital/client';
import { useEffect, useState } from 'react';
import { getSdkClient } from '@/shared/sdk';

const POLL_INTERVAL_MS = 1500;

export interface ConnectionSnapshot {
  transports: TransportsWebRTCStats;
  meta: ClientMetaPayload;
  isRelayEnforced: boolean;
}

const read = (): ConnectionSnapshot => {
  const client = getSdkClient();

  return {
    transports: client.transportsStats() ?? {},
    meta: client.meta,
    isRelayEnforced: client.isRelayEnforced(),
  };
};

export function useConnectionStats(): ConnectionSnapshot {
  const [snapshot, setSnapshot] = useState(read);

  useEffect(() => {
    const timer = setInterval(() => setSnapshot(read()), POLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  return snapshot;
}
