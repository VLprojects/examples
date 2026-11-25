import type { Peer } from '@livedigital/client';
import { useTranslation } from 'react-i18next';
import { AudioView, VideoView } from '@/shared/ui';
import { usePeerAppData } from '../model/usePeerAppData';
import { usePeerTracks } from '../model/usePeerTracks';
import { usePublishedMedia } from '../model/usePublishedMedia';
import { useTrackVolume } from '../model/useTrackVolume';

interface PeerTileProps {
  peer: Peer;
  isActiveSpeaker?: boolean;
  audioOutputDeviceId?: string;
}

const AUDIO_LABELS = ['microphone', 'screen-audio'];

export function PeerTile({ peer, isActiveSpeaker, audioOutputDeviceId }: PeerTileProps) {
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

  return (
    <div className={isSpeaking ? 'peer-tile peer-tile--speaking' : 'peer-tile'}>
      {isCameraVisible
        ? <VideoView track={camera.mediaStreamTrack} mirrored={peer.isMe} />
        : <div className="peer-tile__avatar">{displayName.slice(0, 1).toUpperCase() || '?'}</div>}
      {audioTracks.map((track) => (
        <AudioView key={track.label} track={track.mediaStreamTrack} outputDeviceId={audioOutputDeviceId} />
      ))}
      {isHandRaised && <div className="peer-tile__hand" title={t('room.handRaised')}>✋</div>}
      <div className="peer-tile__caption">
        <span className={isMicrophoneOn ? 'peer-tile__mic peer-tile__mic--on' : 'peer-tile__mic'} />
        {name}
      </div>
    </div>
  );
}
