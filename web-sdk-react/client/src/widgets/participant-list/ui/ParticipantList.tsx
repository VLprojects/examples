import { PeerRow } from '@/entities/peer';
import { useSessionStore } from '@/entities/session';
import { PinToggle } from '@/features/pin-peer';

export function ParticipantList() {
  const peers = useSessionStore((state) => state.peers);

  return (
    <ul className="participant-list">
      {peers.map((peer) => <PeerRow key={peer.id} peer={peer} actions={<PinToggle peerId={peer.id} />} />)}
    </ul>
  );
}
