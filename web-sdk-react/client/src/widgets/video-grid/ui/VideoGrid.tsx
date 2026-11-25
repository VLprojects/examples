import { useDeviceStore } from '@/entities/device';
import { PeerTile, ScreenTile } from '@/entities/peer';
import { useSessionStore } from '@/entities/session';

export function VideoGrid() {
  const peers = useSessionStore((state) => state.peers);
  const activeSpeakerId = useSessionStore((state) => state.activeSpeakerId);
  const presenterId = useSessionStore((state) => state.presenterId);
  const speakerDeviceId = useDeviceStore((state) => state.selected.speaker);
  const presenter = peers.find(({ id }) => id === presenterId);

  const tiles = peers.map((peer) => (
    <PeerTile
      key={peer.id}
      peer={peer}
      isActiveSpeaker={peer.id === activeSpeakerId}
      audioOutputDeviceId={speakerDeviceId}
    />
  ));

  return (
    <div className={presenter ? 'stage stage--presentation' : 'stage'}>
      {presenter && <ScreenTile peer={presenter} />}
      <div className={presenter ? 'stage__strip' : 'video-grid'} data-count={Math.min(peers.length, 9)}>{tiles}</div>
    </div>
  );
}
