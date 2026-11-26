import type { Peer } from '@livedigital/client';
import { useEffect, useRef, useState } from 'react';
import { buildPeerDebugSnapshot, readTrackCodecs, withCodecs } from './snapshot';
import type {
  LocalTracks, PeerDebugSnapshot, TrackCodecs, TrackLabels,
} from './snapshot';

const POLL_INTERVAL_MS = 1500;
const HISTORY_SIZE = 40;

export interface DebugHistory {
  videoBitrate: number[];
  audioBitrate: number[];
  fps: number[];
  videoLossPercent: number[];
  audioLossPercent: number[];
}

export interface PeerDebug {
  snapshot: PeerDebugSnapshot;
  history: DebugHistory;
}

const EMPTY_HISTORY: DebugHistory = {
  videoBitrate: [], audioBitrate: [], fps: [], videoLossPercent: [], audioLossPercent: [],
};

interface PacketCounters {
  packets?: number;
  packetsLost?: number;
}

const intervalLossPercent = (current: PacketCounters | undefined, previous: PacketCounters | undefined) => {
  if (current?.packets === undefined || current.packetsLost === undefined
    || previous?.packets === undefined || previous.packetsLost === undefined) {
    return undefined;
  }

  const lost = current.packetsLost - previous.packetsLost;
  const received = current.packets - previous.packets;

  return lost + received > 0 ? Math.max(0, (lost / (lost + received)) * 100) : 0;
};

const push = (values: number[], value: number | undefined) => (
  value === undefined ? values : [...values, value].slice(-HISTORY_SIZE)
);

const extend = (history: DebugHistory, current: PeerDebugSnapshot, previous: PeerDebugSnapshot | undefined): DebugHistory => ({
  videoBitrate: push(history.videoBitrate, current.video?.bitrate),
  audioBitrate: push(history.audioBitrate, current.audio?.bitrate),
  fps: push(history.fps, current.video?.fps),
  videoLossPercent: push(history.videoLossPercent, intervalLossPercent(current.video, previous?.video)),
  audioLossPercent: push(history.audioLossPercent, intervalLossPercent(current.audio, previous?.audio)),
});

export function usePeerDebug(peer: Peer, labels: TrackLabels, localTracks?: LocalTracks): PeerDebug {
  const [debug, setDebug] = useState<PeerDebug>(() => ({
    snapshot: buildPeerDebugSnapshot(peer, labels, localTracks),
    history: EMPTY_HISTORY,
  }));
  const [codecs, setCodecs] = useState<TrackCodecs>({});
  const source = useRef({ peer, labels, localTracks });

  useEffect(() => {
    source.current = { peer, labels, localTracks };
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const { current } = source;
      const snapshot = buildPeerDebugSnapshot(current.peer, current.labels, current.localTracks);

      setDebug((previous) => ({ snapshot, history: extend(previous.history, snapshot, previous.snapshot) }));
      void readTrackCodecs(current.peer, current.labels, current.localTracks).then(setCodecs);
    }, POLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  return { ...debug, snapshot: withCodecs(debug.snapshot, codecs) };
}
