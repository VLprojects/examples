import { PeerTile } from '@/entities/peer';
import { useSessionStore } from '@/entities/session';

export function VideoGrid() {
  const peers = useSessionStore((state) => state.peers);

  return (
    <div className="video-grid" data-count={Math.min(peers.length, 9)}>
      {peers.map((peer) => <PeerTile key={peer.id} peer={peer} />)}
    </div>
  );
}
