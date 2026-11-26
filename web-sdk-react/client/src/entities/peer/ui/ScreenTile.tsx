import type { Peer } from '@livedigital/client';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { VideoView } from '@/shared/ui';
import { usePeerAppData } from '../model/usePeerAppData';
import { usePeerTracks } from '../model/usePeerTracks';

interface ScreenTileProps {
  peer: Peer;
  debug?: ReactNode;
}

export function ScreenTile({ peer, debug }: ScreenTileProps) {
  const { t } = useTranslation();
  const screen = usePeerTracks(peer).get('screen-video');
  const { displayName } = usePeerAppData(peer);

  return (
    <div className="peer-tile peer-tile--main">
      {screen && <VideoView track={screen.mediaStreamTrack} contain />}
      {debug && <div className="peer-tile__debug">{debug}</div>}
      <div className="peer-tile__caption">{t('room.screenOf', { name: displayName })}</div>
    </div>
  );
}
