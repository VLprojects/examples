import type { Client, Peer } from '@livedigital/client';
import { create } from 'zustand';
import { getSdkClient } from '@/shared/sdk';

export type SessionStatus = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'kicked' | 'error';

interface ConnectParams {
  getToken: () => Promise<string>;
  appData: Record<string, unknown>;
}

interface SessionState {
  status: SessionStatus;
  peers: Peer[];
  connect: (params: ConnectParams) => Promise<void>;
  disconnect: () => Promise<void>;
}

let connectParams: ConnectParams | undefined;

const join = async () => {
  if (!connectParams) {
    return;
  }

  const client = getSdkClient();
  const token = await connectParams.getToken();

  await client.join({ token, appData: connectParams.appData });
  await client.requestChannelStateSync();
};

export const useSessionStore = create<SessionState>((set) => ({
  status: 'idle',
  peers: [],

  connect: async (params) => {
    connectParams = params;
    set({ status: 'connecting' });

    try {
      await join();
    } catch (error) {
      set({ status: 'error' });
      throw error;
    }
  },

  disconnect: async () => {
    connectParams = undefined;
    await getSdkClient().leave();
    set({ status: 'idle', peers: [] });
  },
}));

const isPublisher = (peer: Peer) => peer.role === 'host';

const subscribedPeers = new WeakSet<Peer>();

const subscribeToPeerMedia = (peer: Peer) => {
  if (peer.isMe || subscribedPeers.has(peer)) {
    return;
  }

  subscribedPeers.add(peer);

  const subscribe = ({ producerId }: { producerId: string }) => {
    void peer.subscribe({ producerId });
  };

  peer.observer.on('media-published', subscribe);
  peer.publishedMedia.forEach(subscribe);
};

export const bindSessionEvents = (client: Client) => {
  const { setState } = useSessionStore;

  client.observer.on('channel-state-synced', () => {
    const peers = client.peers.filter(isPublisher);

    peers.forEach(subscribeToPeerMedia);
    setState({ status: 'connected', peers });
  });

  client.observer.on('peer-joined', (peer) => {
    if (!isPublisher(peer)) {
      return;
    }

    subscribeToPeerMedia(peer);
    setState(({ peers }) => ({ peers: peers.some(({ id }) => id === peer.id) ? peers : [...peers, peer] }));
  });

  client.observer.on('peer-left', (peerId) => {
    setState(({ peers }) => ({ peers: peers.filter(({ id }) => id !== peerId) }));
  });

  client.observer.on('connection-lost', () => setState({ status: 'reconnecting' }));
  client.observer.on('connection-restored', () => setState({ status: 'connected' }));

  client.observer.on('channel-rejoin-required', () => {
    join().catch(() => setState({ status: 'error' }));
  });

  client.observer.on('forced-disconnect', () => {
    connectParams = undefined;
    setState({ status: 'kicked', peers: [] });
  });

  client.observer.on('reject-unauthorized', () => setState({ status: 'error' }));
};
