import { create } from 'zustand';

interface PinState {
  pinnedPeerId: string | undefined;
  toggle: (peerId: string) => void;
}

export const usePinStore = create<PinState>((set) => ({
  pinnedPeerId: undefined,
  toggle: (peerId) => set(({ pinnedPeerId }) => ({ pinnedPeerId: pinnedPeerId === peerId ? undefined : peerId })),
}));
