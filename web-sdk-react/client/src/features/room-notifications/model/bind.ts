import type { Client, Peer } from '@livedigital/client';
import { useSessionStore } from '@/entities/session';
import { showToast } from '@/shared/ui';

const nameOf = (peer: Peer) => (typeof peer.appData.displayName === 'string' ? peer.appData.displayName : '');

export const bindRoomNotifications = (client: Client) => {
  const names = new Map<string, string>();

  client.observer.on('channel-state-synced', () => {
    names.clear();
    client.peers.forEach((peer) => names.set(peer.id, nameOf(peer)));
  });

  client.observer.on('peer-joined', (peer) => {
    if (useSessionStore.getState().status === 'connected' && !names.has(peer.id)) {
      showToast('room.peerJoined', { params: { name: nameOf(peer) } });
    }

    names.set(peer.id, nameOf(peer));
  });

  client.observer.on('peer-left', (peerId) => {
    const name = names.get(peerId);

    if (name !== undefined) {
      showToast('room.peerLeft', { params: { name } });
    }

    names.delete(peerId);
  });
};
