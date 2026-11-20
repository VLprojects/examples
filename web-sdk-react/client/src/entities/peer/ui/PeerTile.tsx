import type { Peer } from '@livedigital/client';
import { useTranslation } from 'react-i18next';
import { usePeerDisplayName } from '../model/usePeerDisplayName';
import { usePeerTracks } from '../model/usePeerTracks';
import { usePublishedMedia } from '../model/usePublishedMedia';
import { VideoView } from './VideoView';

interface PeerTileProps {
  peer: Peer;
}

export function PeerTile({ peer }: PeerTileProps) {
  const { t } = useTranslation();
  const tracks = usePeerTracks(peer);
  const displayName = usePeerDisplayName(peer);
  const publishedMedia = usePublishedMedia(peer);

  const camera = tracks.get('camera');
  const isCameraVisible = camera && !camera.isPaused;
  const isMicrophoneOn = publishedMedia.some(({ label, paused }) => label === 'microphone' && !paused);
  const name = peer.isMe ? `${displayName} (${t('room.you')})` : displayName;

  return (
    <div className="peer-tile">
      {isCameraVisible
        ? <VideoView track={camera.mediaStreamTrack} mirrored={peer.isMe} />
        : <div className="peer-tile__avatar">{displayName.slice(0, 1).toUpperCase() || '?'}</div>}
      <div className="peer-tile__caption">
        <span className={isMicrophoneOn ? 'peer-tile__mic peer-tile__mic--on' : 'peer-tile__mic'} />
        {name}
      </div>
    </div>
  );
}
