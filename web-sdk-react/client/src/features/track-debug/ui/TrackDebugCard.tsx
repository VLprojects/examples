import type { Peer } from '@livedigital/client';
import { Copy, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { docsUrl } from '@/shared/config';
import { formatBitrate, formatPercent, formatScore } from '@/shared/lib';
import {
  Button, IconButton, Sparkline, StatRow, Tabs, showToast,
} from '@/shared/ui';
import {
  requestKeyFrame, requestLayers, setMaxSpatialLayer, toggleReceiving,
} from '../model/actions';
import type { LayerParams, LocalTracks } from '../model/snapshot';
import {
  jitterTone, limitationTone, lossTone, scoreTone,
} from '../model/tones';
import type { PeerDebug } from '../model/usePeerDebug';

const TABS = ['overview', 'video', 'audio', 'layers', 'peer'] as const;

type CardTab = typeof TABS[number];

interface TrackDebugCardProps {
  peer: Peer;
  debug: PeerDebug;
  localTracks?: LocalTracks;
  onClose: () => void;
}

const formatNumber = (value: number | undefined, unit = '') => (value === undefined ? '—' : `${Math.round(value)}${unit}`);

const formatResolution = (width: number | undefined, height: number | undefined) => (
  width && height ? `${width}×${height}` : '—'
);

const formatLayer = ({
  width, height, maxBitrate, maxFramerate, scaleResolutionDownBy,
}: LayerParams) => [
  width && height ? `${width}×${height}` : scaleResolutionDownBy && `÷${scaleResolutionDownBy}`,
  maxBitrate && formatBitrate(maxBitrate),
  maxFramerate && `${maxFramerate} fps`,
].filter(Boolean).join(' · ');

const STATS_DOCS_URL = docsUrl('network-quality', 'низкоуровневая-статистика');
const LAYERS_DOCS_URL = docsUrl('bandwidth-management', 'адаптивное-качество-видео-simulcast--svc');

const HINT_CODE = {
  bitrate: 'track.videoWebRTCStats.bitrate\ntrack.audioWebRTCStats.bitrate',
  loss: 'packetsLost / (packetsReceived + packetsLost)',
  scores: 'track.connectionScores',
  compositeScore: 'client.scoresCalculator.calculateAVCompositeMOS(Qa, Qv)',
  codec: '(await track.getInfo()).trackInboundStats.codec.mimeType',
  implementation: 'track.videoWebRTCStats.decoderImplementation · encoderImplementation',
  jitter: 'track.videoWebRTCStats.jitter',
  freezes: 'track.videoWebRTCStats.freezeCount',
  framesDropped: 'track.videoWebRTCStats.framesDropped',
  qualityLimitation: 'track.videoWebRTCStats.qualityLimitationReason',
  feedback: 'track.videoWebRTCStats.nackCount · pliCount · firCount',
  retransmitted: 'track.videoWebRTCStats.retransmittedPacketsSent',
  concealed: 'track.audioWebRTCStats.concealedSamples',
  targetBitrate: 'track.audioWebRTCStats.targetBitrate',
  currentLayer: 'track.consumer.currentSpatialLayer · currentTemporalLayer',
  requestedLayer: 'track.requestVideoPreferredLayers({ spatialLayer, temporalLayer })',
  layerCount: 'track.getVideoAvailableLayers()',
  maxLayer: 'track.setMaxSpatialLayer(spatialLayer)',
  preferredCodec: 'track.getPreferredCodec() · track.getEncodings()',
};
const LAYER_HINTS: (keyof typeof HINT_CODE)[] = ['currentLayer', 'requestedLayer', 'layerCount', 'maxLayer', 'preferredCodec'];

const range = (length: number) => Array.from({ length }, (_, index) => index);

export function TrackDebugCard({
  peer, debug, localTracks, onClose,
}: TrackDebugCardProps) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<CardTab>('overview');
  const { snapshot, history } = debug;
  const {
    direction, labels, video, audio, scores, inboundLayers, outboundLayers,
  } = snapshot;
  const isInbound = direction === 'inbound';
  const videoLoss = history.videoLossPercent.at(-1);
  const audioLoss = history.audioLossPercent.at(-1);

  const hint = (id: keyof typeof HINT_CODE) => ({
    text: t(`dev.track.hints.${id}`),
    code: HINT_CODE[id],
    docsUrl: LAYER_HINTS.includes(id) ? LAYERS_DOCS_URL : STATS_DOCS_URL,
  });

  const copy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(snapshot, null, 2));
    showToast('dev.copied');
  };

  return (
    <div className="track-debug__card">
      <header className="track-debug__header">
        <strong>{t(`dev.track.direction.${direction}`)}</strong>
        <IconButton size="small" label={t('dev.track.copy')} onClick={() => void copy()}>
          <Copy size={14} />
        </IconButton>
        <IconButton size="small" label={t('dev.track.close')} onClick={onClose}>
          <X size={14} />
        </IconButton>
      </header>
      <Tabs
        label={t('dev.track.title')}
        value={tab}
        tabs={TABS.map((id) => ({ id, label: t(`dev.track.tabs.${id}`) }))}
        onChange={setTab}
      />
      <div className="track-debug__body" role="tabpanel" aria-label={t(`dev.track.tabs.${tab}`)}>
        {tab === 'overview' && (
          <dl className="stats__list">
            <StatRow
              label={t('dev.track.videoBitrate')}
              value={formatBitrate(video?.bitrate)}
              hint={hint('bitrate')}
              chart={<Sparkline values={history.videoBitrate} label={t('dev.track.videoBitrate')} />}
            />
            <StatRow
              label={t('dev.track.audioBitrate')}
              value={formatBitrate(audio?.bitrate)}
              chart={<Sparkline values={history.audioBitrate} label={t('dev.track.audioBitrate')} />}
            />
            {isInbound && (
              <>
                <StatRow label={t('dev.track.videoLoss')} value={formatPercent(videoLoss)} tone={lossTone(videoLoss)} hint={hint('loss')} />
                <StatRow label={t('dev.track.audioLoss')} value={formatPercent(audioLoss)} tone={lossTone(audioLoss)} />
              </>
            )}
            <StatRow label="Qa" value={formatScore(scores.Qa)} tone={scoreTone(scores.Qa)} hint={hint('scores')} />
            <StatRow label="Qv" value={formatScore(scores.Qv)} tone={scoreTone(scores.Qv)} />
            <StatRow label="Qav" value={formatScore(scores.Qav)} tone={scoreTone(scores.Qav)} hint={hint('compositeScore')} />
          </dl>
        )}
        {tab === 'video' && (video ? (
          <>
            {isInbound && (
              <div className="track-debug__actions">
                <Button onClick={() => requestKeyFrame(peer, labels.video)}>{t('dev.track.keyFrame')}</Button>
                <Button onClick={() => toggleReceiving(peer, labels.video)}>
                  {t(video.isPaused ? 'dev.track.resume' : 'dev.track.pause')}
                </Button>
              </div>
            )}
            <dl className="stats__list">
              <StatRow label={t('dev.track.codec')} value={video.codec} hint={hint('codec')} />
              <StatRow label={t(isInbound ? 'dev.track.decoder' : 'dev.track.encoder')} value={video.implementation} hint={hint('implementation')} />
              <StatRow label={t('dev.track.resolution')} value={formatResolution(video.width, video.height)} />
              <StatRow
                label="fps"
                value={formatNumber(video.fps)}
                chart={<Sparkline values={history.fps} label="fps" />}
              />
              <StatRow
                label={t('dev.track.bitrate')}
                value={formatBitrate(video.bitrate)}
                chart={<Sparkline values={history.videoBitrate} label={t('dev.track.bitrate')} />}
              />
              {isInbound ? (
                <>
                  <StatRow
                    label={t('dev.track.loss')}
                    value={formatPercent(videoLoss)}
                    tone={lossTone(videoLoss)}
                    chart={<Sparkline values={history.videoLossPercent} label={t('dev.track.loss')} />}
                  />
                  <StatRow label={t('dev.track.jitter')} value={formatNumber(video.jitterMs, ' ms')} tone={jitterTone(video.jitterMs)} hint={hint('jitter')} />
                  <StatRow label={t('dev.track.packets')} value={`${formatNumber(video.packets)} / ${formatNumber(video.packetsLost)}`} />
                  <StatRow label={t('dev.track.freezes')} value={formatNumber(video.freezeCount)} hint={hint('freezes')} />
                  <StatRow label={t('dev.track.framesDropped')} value={formatNumber(video.framesDropped)} hint={hint('framesDropped')} />
                </>
              ) : (
                <>
                  <StatRow label={t('dev.track.packetsSent')} value={`${formatNumber(video.packets)} / ${formatNumber(video.retransmittedPackets)}`} hint={hint('retransmitted')} />
                  <StatRow
                    label={t('dev.track.qualityLimitation')}
                    value={video.qualityLimitationReason}
                    hint={hint('qualityLimitation')}
                    tone={limitationTone(video.qualityLimitationReason)}
                  />
                </>
              )}
              <StatRow label="nack / pli / fir" value={`${formatNumber(video.nackCount)} / ${formatNumber(video.pliCount)} / ${formatNumber(video.firCount)}`} hint={hint('feedback')} />
            </dl>
          </>
        ) : <p className="hint">{t('dev.track.noVideo')}</p>)}
        {tab === 'audio' && (audio ? (
          <>
            {isInbound && (
              <div className="track-debug__actions">
                <Button onClick={() => toggleReceiving(peer, labels.audio)}>
                  {t(audio.isPaused ? 'dev.track.resume' : 'dev.track.pause')}
                </Button>
              </div>
            )}
            <dl className="stats__list">
              <StatRow label={t('dev.track.codec')} value={audio.codec} />
              <StatRow
                label={t('dev.track.bitrate')}
                value={formatBitrate(audio.bitrate)}
                chart={<Sparkline values={history.audioBitrate} label={t('dev.track.bitrate')} />}
              />
              {audio.targetBitrate !== undefined && <StatRow label={t('dev.track.targetBitrate')} value={formatBitrate(audio.targetBitrate)} hint={hint('targetBitrate')} />}
              <StatRow
                label={t('dev.track.level')}
                value={<meter className="track-debug__level" min={0} max={1} value={audio.level ?? 0} />}
              />
              {isInbound ? (
                <>
                  <StatRow
                    label={t('dev.track.loss')}
                    value={formatPercent(audioLoss)}
                    tone={lossTone(audioLoss)}
                    chart={<Sparkline values={history.audioLossPercent} label={t('dev.track.loss')} />}
                  />
                  <StatRow label={t('dev.track.jitter')} value={formatNumber(audio.jitterMs, ' ms')} tone={jitterTone(audio.jitterMs)} />
                  <StatRow label={t('dev.track.packets')} value={`${formatNumber(audio.packets)} / ${formatNumber(audio.packetsLost)}`} />
                  <StatRow label={t('dev.track.concealed')} value={formatNumber(audio.concealedSamples)} hint={hint('concealed')} />
                </>
              ) : (
                <StatRow label={t('dev.track.packetsSent')} value={`${formatNumber(audio.packets)} / ${formatNumber(audio.retransmittedPackets)}`} />
              )}
            </dl>
          </>
        ) : <p className="hint">{t('dev.track.noAudio')}</p>)}
        {tab === 'layers' && inboundLayers && (
          <>
            <div className="track-debug__actions">
              <label>
                <span>{t('dev.track.spatial')}</span>
                <select
                  value={inboundLayers.requestedSpatialLayer ?? inboundLayers.currentSpatialLayer}
                  onChange={({ target }) => requestLayers(peer, labels.video, Number(target.value), inboundLayers.currentTemporalLayer)}
                >
                  {range(inboundLayers.spatialLayers).map((layer) => <option key={layer} value={layer}>{layer}</option>)}
                </select>
              </label>
              <label>
                <span>{t('dev.track.temporal')}</span>
                <select
                  value={inboundLayers.currentTemporalLayer}
                  onChange={({ target }) => requestLayers(peer, labels.video, inboundLayers.currentSpatialLayer, Number(target.value))}
                >
                  {range(inboundLayers.temporalLayers).map((layer) => <option key={layer} value={layer}>{layer}</option>)}
                </select>
              </label>
            </div>
            <dl className="stats__list">
              <StatRow label={t('dev.track.currentLayer')} value={`S${inboundLayers.currentSpatialLayer} / T${inboundLayers.currentTemporalLayer}`} hint={hint('currentLayer')} />
              <StatRow label={t('dev.track.requestedLayer')} value={inboundLayers.requestedSpatialLayer === undefined ? '—' : `S${inboundLayers.requestedSpatialLayer}`} hint={hint('requestedLayer')} />
              <StatRow label={t('dev.track.layerCount')} value={`${inboundLayers.spatialLayers} / ${inboundLayers.temporalLayers}`} hint={hint('layerCount')} />
              <StatRow label={t('dev.track.maxLayer')} value={`S${inboundLayers.maxSpatialLayer}`} hint={hint('maxLayer')} />
              {inboundLayers.available.map((layer, index) => (
                <StatRow key={index} label={`S${index}`} value={formatLayer(layer)} />
              ))}
              <StatRow label="consumerId" value={inboundLayers.consumerId} />
              <StatRow label="producerId" value={inboundLayers.producerId} />
            </dl>
          </>
        )}
        {tab === 'layers' && outboundLayers && (
          <>
            {outboundLayers.encodings.length > 1 && (
              <div className="track-debug__actions">
                <label>
                  <span>{t('dev.track.maxLayer')}</span>
                  <select
                    value={outboundLayers.maxSpatialLayer ?? outboundLayers.encodings.length - 1}
                    onChange={({ target }) => setMaxSpatialLayer(localTracks?.video, Number(target.value))}
                  >
                    {range(outboundLayers.encodings.length).map((layer) => <option key={layer} value={layer}>{layer}</option>)}
                  </select>
                </label>
              </div>
            )}
            <dl className="stats__list">
              <StatRow label={t('dev.track.preferredCodec')} value={outboundLayers.preferredCodec} hint={hint('preferredCodec')} />
              {outboundLayers.encodings.map((layer, index) => (
                <StatRow key={index} label={`S${index}`} value={formatLayer(layer)} />
              ))}
              <StatRow label="producerId" value={outboundLayers.producerId} />
            </dl>
          </>
        )}
        {tab === 'layers' && !inboundLayers && !outboundLayers && <p className="hint">{t('dev.track.noVideo')}</p>}
        {tab === 'peer' && (
          <dl className="stats__list">
            <StatRow label={t('dev.track.name')} value={snapshot.peer.name} />
            <StatRow label="peerId" value={snapshot.peer.id} />
            <StatRow label={t('dev.track.moderator')} value={t(snapshot.peer.isModerator ? 'dev.yes' : 'dev.no')} />
            {snapshot.peer.publishedMedia.map(({ label, paused }) => (
              <StatRow key={label} label={label} value={t(paused ? 'dev.track.paused' : 'dev.track.active')} />
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}
