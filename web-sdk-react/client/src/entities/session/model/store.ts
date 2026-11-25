import type { Client, Peer } from '@livedigital/client';
import { create } from 'zustand';
import { getSdkClient } from '@/shared/sdk';

export type SessionStatus = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'left' | 'kicked' | 'error';

type AppData = Record<string, unknown>;

interface ConnectParams {
  getToken: () => Promise<string>;
  appData: AppData;
}

interface SessionState {
  status: SessionStatus;
  peers: Peer[];
  appData: AppData;
  activeSpeakerId: string | undefined;
  presenterId: string | undefined;
  connect: (params: ConnectParams) => Promise<void>;
  disconnect: () => Promise<void>;
  reset: () => void;
  updateAppData: (patch: AppData) => Promise<void>;
  refreshPresenter: () => void;
}

const IDLE_STATE = { peers: [], appData: {}, activeSpeakerId: undefined, presenterId: undefined };

let getToken: ConnectParams['getToken'] | undefined;

const join = async (appData: AppData) => {
  if (!getToken) {
    return;
  }

  const client = getSdkClient();
  const token = await getToken();

  await client.join({ token, appData });
  await client.requestChannelStateSync();
};

const isPublisher = (peer: Peer) => peer.role === 'host';

const findPresenterId = () => getSdkClient().peers.find(
  (peer) => peer.publishedMedia.some(({ label }) => label === 'screen-video'),
)?.id;

export const useSessionStore = create<SessionState>((set, get) => ({
  status: 'idle',
  ...IDLE_STATE,

  connect: async ({ getToken: tokenProvider, appData }) => {
    const client = getSdkClient();
    const synced = new Promise<void>((resolve) => {
      client.observer.once('channel-state-synced', () => resolve());
    });

    getToken = tokenProvider;
    set({ status: 'connecting', appData });

    try {
      await join(appData);
      await synced;
    } catch (error) {
      set({ status: 'error' });
      throw error;
    }
  },

  disconnect: async () => {
    getToken = undefined;
    await getSdkClient().leave();
    set({ status: 'left', ...IDLE_STATE });
  },

  reset: () => set({ status: 'idle' }),

  updateAppData: async (patch) => {
    const appData = { ...get().appData, ...patch };

    await getSdkClient().updateAppData(appData);
    set({ appData });
  },

  refreshPresenter: () => set({ presenterId: findPresenterId() }),
}));

const watchedPeers = new WeakSet<Peer>();

const watchPeer = (peer: Peer) => {
  if (watchedPeers.has(peer)) {
    return;
  }

  watchedPeers.add(peer);

  const { refreshPresenter } = useSessionStore.getState();
  const subscribe = ({ producerId }: { producerId: string }) => {
    if (!peer.isMe) {
      void peer.subscribe({ producerId });
    }
  };

  peer.observer.on('media-published', (media) => {
    subscribe(media);
    refreshPresenter();
  });
  peer.observer.on('media-unpublished', refreshPresenter);
  peer.publishedMedia.forEach(subscribe);
};

export const bindSessionEvents = (client: Client) => {
  const { setState, getState } = useSessionStore;

  client.observer.on('channel-state-synced', () => {
    const peers = client.peers.filter(isPublisher);

    peers.forEach(watchPeer);
    setState({ status: 'connected', peers, presenterId: findPresenterId() });
  });

  client.observer.on('peer-joined', (peer) => {
    if (!isPublisher(peer)) {
      return;
    }

    watchPeer(peer);
    setState(({ peers }) => ({ peers: peers.some(({ id }) => id === peer.id) ? peers : [...peers, peer] }));
  });

  client.observer.on('peer-left', (peerId) => {
    setState(({ peers }) => ({ peers: peers.filter(({ id }) => id !== peerId), presenterId: findPresenterId() }));
  });

  client.observer.on('active-speaker-changed', ({ peer }) => setState({ activeSpeakerId: peer?.id }));

  client.observer.on('connection-lost', () => setState({ status: 'reconnecting' }));
  client.observer.on('connection-restored', () => setState({ status: 'connected' }));

  client.observer.on('channel-rejoin-required', () => {
    join(getState().appData).catch(() => setState({ status: 'error' }));
  });

  client.observer.on('forced-disconnect', () => {
    getToken = undefined;
    setState({ status: 'kicked', ...IDLE_STATE });
  });

  client.observer.on('reject-unauthorized', () => setState({ status: 'error' }));
};
