import type { Peer } from '@livedigital/client';
import { Hand, Mic, MicOff, ScreenShare, Video, VideoOff } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { usePeerAppData } from '../model/usePeerAppData';
import { usePublishedMedia } from '../model/usePublishedMedia';

interface PeerRowProps {
  peer: Peer;
  actions?: ReactNode;
}

export function PeerRow({ peer, actions }: PeerRowProps) {
  const { t } = useTranslation();
  const { displayName, isHandRaised } = usePeerAppData(peer);
  const publishedMedia = usePublishedMedia(peer);
  const isPublishing = (mediaLabel: string) => publishedMedia.some(({ label, paused }) => label === mediaLabel && !paused);

  return (
    <li className="peer-row">
      <span className="peer-row__avatar">{displayName.slice(0, 1).toUpperCase() || '?'}</span>
      <span className="peer-row__name">{peer.isMe ? `${displayName} (${t('room.you')})` : displayName}</span>
      <span className="peer-row__state">
        {isHandRaised && <Hand size={16} className="peer-row__hand" aria-label={t('room.handRaised')} />}
        {isPublishing('screen-video') && <ScreenShare size={16} />}
        {isPublishing('microphone') ? <Mic size={16} /> : <MicOff size={16} className="peer-row__off" />}
        {isPublishing('camera') ? <Video size={16} /> : <VideoOff size={16} className="peer-row__off" />}
      </span>
      {actions}
    </li>
  );
}
