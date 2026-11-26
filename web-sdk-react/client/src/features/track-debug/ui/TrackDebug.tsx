import type { Peer } from '@livedigital/client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatBitrate } from '@/shared/lib';
import type { LocalTracks, TrackLabels } from '../model/snapshot';
import { selectOverallTone } from '../model/tones';
import { usePeerDebug } from '../model/usePeerDebug';
import { TrackDebugCard } from './TrackDebugCard';

const TRACK_LABELS: Record<'camera' | 'screen', TrackLabels> = {
  camera: { video: 'camera', audio: 'microphone' },
  screen: { video: 'screen-video', audio: 'screen-audio' },
};

interface TrackDebugProps {
  peer: Peer;
  source?: 'camera' | 'screen';
  localTracks?: LocalTracks;
}

export function TrackDebug({ peer, source = 'camera', localTracks }: TrackDebugProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const debug = usePeerDebug(peer, TRACK_LABELS[source], localTracks);
  const { video, audio, inboundLayers } = debug.snapshot;
  const tone = selectOverallTone(debug) ?? 'good';

  if (isExpanded) {
    return <TrackDebugCard peer={peer} debug={debug} localTracks={localTracks} onClose={() => setIsExpanded(false)} />;
  }

  const summary = [
    video?.width && video.height ? `${video.width}×${video.height}` : undefined,
    video?.fps === undefined ? undefined : `${Math.round(video.fps)} fps`,
    video?.bitrate === undefined && audio?.bitrate === undefined
      ? undefined
      : formatBitrate((video?.bitrate ?? 0) + (audio?.bitrate ?? 0)),
    inboundLayers && `S${inboundLayers.currentSpatialLayer}/T${inboundLayers.currentTemporalLayer}`,
  ].filter(Boolean).join(' · ');

  return (
    <button
      type="button"
      className="track-debug__strip"
      aria-label={t('dev.track.open')}
      title={t('dev.track.open')}
      onClick={() => setIsExpanded(true)}
    >
      <span className={`track-debug__dot track-debug__dot--${tone}`} />
      {summary || t('dev.track.noMedia')}
    </button>
  );
}
