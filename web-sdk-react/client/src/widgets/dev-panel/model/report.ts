import { version as sdkVersion } from '@livedigital/client/package.json';
import { useSessionStore } from '@/entities/session';
import { useEventLogStore } from '@/features/event-log';
import { useLocalMediaStore } from '@/features/local-media';
import { useNetworkQualityStore } from '@/features/network-quality';
import { toReportEntry, useSdkLogStore } from '@/features/sdk-log';
import { readPeerDebugSnapshot } from '@/features/track-debug';
import { getSdkClient } from '@/shared/sdk';

const CAMERA_LABELS = { video: 'camera', audio: 'microphone' };
const REPORTED_EVENTS = 100;

export const buildDiagnosticsReport = async () => {
  const client = getSdkClient();
  const { peers, status } = useSessionStore.getState();
  const { tracks } = useLocalMediaStore.getState();
  const localTracks = { video: tracks.camera, audio: tracks.microphone };

  return {
    createdAt: new Date().toISOString(),
    sdkVersion,
    userAgent: navigator.userAgent,
    sessionStatus: status,
    meta: client.meta,
    networkQuality: useNetworkQualityStore.getState().quality,
    transports: client.transportsStats() ?? {},
    isRelayEnforced: client.isRelayEnforced(),
    peers: await Promise.all(
      peers.map((peer) => readPeerDebugSnapshot(peer, CAMERA_LABELS, peer.isMe ? localTracks : undefined)),
    ),
    events: useEventLogStore.getState().entries.slice(0, REPORTED_EVENTS),
    logs: useSdkLogStore.getState().entries.map(toReportEntry),
  };
};

export const downloadReport = (report: object) => {
  const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a');

  link.href = url;
  link.download = `livedigital-diagnostics-${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);
};
