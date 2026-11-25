import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { useDeviceStore } from '@/entities/device';
import { PeerTile, ScreenTile } from '@/entities/peer';
import { useSessionStore } from '@/entities/session';
import { CopyLinkButton } from '@/features/copy-invite-link';
import { PinToggle, usePinStore } from '@/features/pin-peer';

export function Stage() {
  const { t } = useTranslation();
  const peers = useSessionStore((state) => state.peers);
  const activeSpeakerId = useSessionStore((state) => state.activeSpeakerId);
  const presenterId = useSessionStore((state) => state.presenterId);
  const speakerDeviceId = useDeviceStore((state) => state.selected.speaker);
  const pinnedPeerId = usePinStore((state) => state.pinnedPeerId);

  const presenter = peers.find(({ id }) => id === presenterId);
  const pinnedPeer = presenter ? undefined : peers.find(({ id }) => id === pinnedPeerId);
  const hasMainTile = Boolean(presenter ?? pinnedPeer);
  const gridSize = { '--columns': Math.ceil(Math.sqrt(peers.length)), '--compact-columns': peers.length > 2 ? 2 : 1 };

  return (
    <div className={hasMainTile ? 'stage stage--focus' : 'stage'}>
      {presenter && <ScreenTile peer={presenter} />}
      <div className="stage__tiles" style={gridSize as CSSProperties}>
        {peers.map((peer) => (
          <PeerTile
            key={peer.id}
            peer={peer}
            isActiveSpeaker={peer.id === activeSpeakerId}
            isMain={peer === pinnedPeer}
            audioOutputDeviceId={speakerDeviceId}
            actions={!presenter && peers.length > 1 && <PinToggle peerId={peer.id} />}
          />
        ))}
      </div>
      {peers.length === 1 && (
        <div className="stage__invite">
          <p>{t('room.alone')}</p>
          <CopyLinkButton />
        </div>
      )}
    </div>
  );
}
