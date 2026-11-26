import type { Peer, PeerTrack, Track } from '@livedigital/client';
import { getSdkClient } from '@/shared/sdk';

export interface TrackLabels {
  video: string;
  audio: string;
}

export interface LocalTracks {
  video?: Track;
  audio?: Track;
}

export interface VideoSnapshot {
  isPaused: boolean;
  codec?: string;
  implementation?: string;
  width?: number;
  height?: number;
  fps?: number;
  bitrate?: number;
  jitterMs?: number;
  packets?: number;
  packetsLost?: number;
  retransmittedPackets?: number;
  freezeCount?: number;
  framesDropped?: number;
  nackCount?: number;
  pliCount?: number;
  firCount?: number;
  qualityLimitationReason?: string;
}

export interface AudioSnapshot {
  isPaused: boolean;
  codec?: string;
  bitrate?: number;
  targetBitrate?: number;
  jitterMs?: number;
  packets?: number;
  packetsLost?: number;
  retransmittedPackets?: number;
  concealedSamples?: number;
  level?: number;
}

export interface LayerParams {
  width?: number;
  height?: number;
  maxBitrate?: number;
  maxFramerate?: number;
  scaleResolutionDownBy?: number;
}

export interface InboundLayers {
  consumerId: string;
  producerId: string;
  spatialLayers: number;
  temporalLayers: number;
  currentSpatialLayer: number;
  currentTemporalLayer: number;
  requestedSpatialLayer?: number;
  maxSpatialLayer: number;
  available: LayerParams[];
}

export interface OutboundLayers {
  producerId?: string;
  maxSpatialLayer?: number;
  preferredCodec?: string;
  encodings: LayerParams[];
}

export interface PeerDebugSnapshot {
  time: number;
  direction: 'inbound' | 'outbound';
  labels: TrackLabels;
  peer: {
    id: string;
    name: string;
    isModerator: boolean;
    publishedMedia: { label: string; paused: boolean }[];
  };
  scores: { Qa?: number; Qv?: number; Qav?: number };
  video?: VideoSnapshot;
  audio?: AudioSnapshot;
  inboundLayers?: InboundLayers;
  outboundLayers?: OutboundLayers;
}

const toMs = (seconds: number | undefined) => (seconds === undefined ? undefined : seconds * 1000);

const toLayerParams = ({
  width, height, maxBitrate, maxFramerate, scaleResolutionDownBy,
}: LayerParams): LayerParams => ({
  width, height, maxBitrate, maxFramerate, scaleResolutionDownBy,
});

const findTrack = (peer: Peer, label: string): PeerTrack | undefined => (
  [...peer.tracks.values()].find((track) => track.label === label)
);

const buildInboundVideo = (track: PeerTrack): VideoSnapshot => {
  const stats = track.videoWebRTCStats;

  return {
    isPaused: track.isPaused,
    implementation: stats?.decoderImplementation,
    width: stats?.frameWidth,
    height: stats?.frameHeight,
    fps: stats?.framesPerSecond,
    bitrate: stats?.bitrate,
    jitterMs: toMs(stats?.jitter),
    packets: stats?.packetsReceived,
    packetsLost: stats?.packetsLost,
    freezeCount: stats?.freezeCount,
    framesDropped: stats?.framesDropped,
    nackCount: stats?.nackCount,
    pliCount: stats?.pliCount,
    firCount: stats?.firCount,
  };
};

const buildInboundAudio = (track: PeerTrack): AudioSnapshot => {
  const stats = track.audioWebRTCStats;

  return {
    isPaused: track.isPaused,
    bitrate: stats?.bitrate,
    jitterMs: toMs(stats?.jitter),
    packets: stats?.packetsReceived,
    packetsLost: stats?.packetsLost,
    concealedSamples: stats?.concealedSamples,
    level: stats?.audioLevel,
  };
};

const buildInboundLayers = (track: PeerTrack): InboundLayers | undefined => {
  const { consumer } = track;

  return consumer && {
    consumerId: consumer.id,
    producerId: consumer.producerId,
    spatialLayers: consumer.spatialLayers,
    temporalLayers: consumer.temporalLayers,
    currentSpatialLayer: consumer.currentSpatialLayer,
    currentTemporalLayer: consumer.currentTemporalLayer,
    requestedSpatialLayer: consumer.requestedSpatialLayer,
    maxSpatialLayer: consumer.currentMaxSpatialLayer,
    available: (track.getVideoAvailableLayers() ?? []).map(toLayerParams),
  };
};

const buildOutboundVideo = (track: Track): VideoSnapshot => {
  const stats = track.videoWebRTCStats;

  return {
    isPaused: track.isPaused,
    implementation: stats?.encoderImplementation,
    width: stats?.frameWidth,
    height: stats?.frameHeight,
    fps: stats?.framesPerSecond,
    bitrate: stats?.bitrate,
    packets: stats?.packetsSent,
    retransmittedPackets: stats?.retransmittedPacketsSent,
    nackCount: stats?.nackCount,
    pliCount: stats?.pliCount,
    firCount: stats?.firCount,
    qualityLimitationReason: stats?.qualityLimitationReason,
  };
};

const buildOutboundAudio = (track: Track): AudioSnapshot => {
  const stats = track.audioWebRTCStats;

  return {
    isPaused: track.isPaused,
    bitrate: stats?.bitrate,
    targetBitrate: stats?.targetBitrate,
    packets: stats?.packetsSent,
    retransmittedPackets: stats?.retransmittedPacketsSent,
    level: stats?.track?.audioLevel,
  };
};

const buildOutboundLayers = (track: Track): OutboundLayers | undefined => (
  'getMaxSpatialLayer' in track ? {
    producerId: track.producerId,
    maxSpatialLayer: track.getMaxSpatialLayer(),
    preferredCodec: track.getPreferredCodec(),
    encodings: track.getEncodings().map(toLayerParams),
  } : undefined
);

const buildScores = (Qa: number | undefined, Qv: number | undefined) => ({
  Qa,
  Qv,
  Qav: Qa !== undefined && Qv !== undefined ? getSdkClient().scoresCalculator.calculateAVCompositeMOS(Qa, Qv) : undefined,
});

export interface TrackCodecs {
  video?: string;
  audio?: string;
}

interface CodecStats {
  codec?: { mimeType?: string };
}

interface TrackInfo {
  trackInboundStats?: CodecStats;
  trackOutboundStats?: CodecStats;
}

const readCodec = async (track: PeerTrack | Track | undefined): Promise<string | undefined> => {
  const info: TrackInfo | undefined = await track?.getInfo().catch(() => undefined);

  return (info?.trackInboundStats ?? info?.trackOutboundStats)?.codec?.mimeType;
};

export const readTrackCodecs = async (peer: Peer, labels: TrackLabels, localTracks?: LocalTracks): Promise<TrackCodecs> => {
  const [video, audio] = await Promise.all([
    readCodec(localTracks ? localTracks.video : findTrack(peer, labels.video)),
    readCodec(localTracks ? localTracks.audio : findTrack(peer, labels.audio)),
  ]);

  return { video, audio };
};

export const withCodecs = (snapshot: PeerDebugSnapshot, codecs: TrackCodecs): PeerDebugSnapshot => ({
  ...snapshot,
  video: snapshot.video && { ...snapshot.video, codec: codecs.video },
  audio: snapshot.audio && { ...snapshot.audio, codec: codecs.audio },
});

export const buildPeerDebugSnapshot = (peer: Peer, labels: TrackLabels, localTracks?: LocalTracks): PeerDebugSnapshot => {
  const base = {
    time: Date.now(),
    labels,
    peer: {
      id: peer.id,
      name: typeof peer.appData.displayName === 'string' ? peer.appData.displayName : '',
      isModerator: peer.isModerator,
      publishedMedia: peer.publishedMedia.map(({ label, paused }) => ({ label, paused })),
    },
  };

  if (localTracks) {
    const { video, audio } = localTracks;

    return {
      ...base,
      direction: 'outbound',
      scores: buildScores(audio?.connectionScores.Qa, video?.connectionScores.Qv),
      video: video && buildOutboundVideo(video),
      audio: audio && buildOutboundAudio(audio),
      outboundLayers: video && buildOutboundLayers(video),
    };
  }

  const video = findTrack(peer, labels.video);
  const audio = findTrack(peer, labels.audio);

  return {
    ...base,
    direction: 'inbound',
    scores: buildScores(audio?.connectionScores.Qa, video?.connectionScores.Qv),
    video: video && buildInboundVideo(video),
    audio: audio && buildInboundAudio(audio),
    inboundLayers: video && buildInboundLayers(video),
  };
};

export const readPeerDebugSnapshot = async (peer: Peer, labels: TrackLabels, localTracks?: LocalTracks) => (
  withCodecs(buildPeerDebugSnapshot(peer, labels, localTracks), await readTrackCodecs(peer, labels, localTracks))
);
