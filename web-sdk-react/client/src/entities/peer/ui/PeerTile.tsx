import type { Peer } from '@livedigital/client';
import { Hand, MicOff } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { AudioView, VideoView } from '@/shared/ui';
import { usePeerAppData } from '../model/usePeerAppData';
import { usePeerTracks } from '../model/usePeerTracks';
import { usePublishedMedia } from '../model/usePublishedMedia';
import { useTrackVolume } from '../model/useTrackVolume';

interface PeerTileProps {
  peer: Peer;
  isActiveSpeaker?: boolean;
  isMain?: boolean;
  audioOutputDeviceId?: string;
  actions?: ReactNode;
}

const AUDIO_LABELS = ['microphone', 'screen-audio'];

export function PeerTile({ peer, isActiveSpeaker, isMain, audioOutputDeviceId, actions }: PeerTileProps) {
  const { t } = useTranslation();
  const tracks = usePeerTracks(peer);
  const { displayName, isHandRaised } = usePeerAppData(peer);
  const publishedMedia = usePublishedMedia(peer);
  const microphoneVolume = useTrackVolume(tracks.get('microphone'));

  const camera = tracks.get('camera');
  const isCameraVisible = camera && !camera.isPaused;
  const isMicrophoneOn = publishedMedia.some(({ label, paused }) => label === 'microphone' && !paused);
  const name = peer.isMe ? `${displayName} (${t('room.you')})` : displayName;
  const isSpeaking = isMicrophoneOn && (isActiveSpeaker || microphoneVolume > 0);
  const audioTracks = peer.isMe ? [] : AUDIO_LABELS.flatMap((label) => tracks.get(label) ?? []);
  const className = ['peer-tile', isSpeaking && 'peer-tile--speaking', isMain && 'peer-tile--main'].filter(Boolean).join(' ');

  return (
    <div className={className} data-peer-id={peer.id}>
      {isCameraVisible
        ? <VideoView track={camera.mediaStreamTrack} mirrored={peer.isMe} contain={isMain} />
        : <div className="peer-tile__avatar">{displayName.slice(0, 1).toUpperCase() || '?'}</div>}
      {audioTracks.map((track) => (
        <AudioView key={track.label} track={track.mediaStreamTrack} outputDeviceId={audioOutputDeviceId} />
      ))}
      {isHandRaised && <div className="peer-tile__hand" title={t('room.handRaised')}><Hand size={18} /></div>}
      {actions && <div className="peer-tile__actions">{actions}</div>}
      <div className="peer-tile__caption">
        {!isMicrophoneOn && <MicOff size={14} className="peer-tile__muted" aria-label={t('room.muted')} />}
        <span className="peer-tile__name">{name}</span>
      </div>
    </div>
  );
}
