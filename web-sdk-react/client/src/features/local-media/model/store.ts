import type { Track } from '@livedigital/client';
import { create } from 'zustand';
import { getSdkClient } from '@/shared/sdk';

export type LocalMediaKind = 'camera' | 'microphone';

interface LocalMediaState {
  tracks: Partial<Record<LocalMediaKind, Track>>;
  pending: Partial<Record<LocalMediaKind, boolean>>;
  failed: boolean;
  toggle: (kind: LocalMediaKind) => Promise<void>;
  reset: () => void;
}

const createTrack = (kind: LocalMediaKind): Promise<Track> => {
  const client = getSdkClient();

  return kind === 'camera' ? client.createCameraVideoTrack() : client.createMicrophoneAudioTrack({ audio: true });
};

export const useLocalMediaStore = create<LocalMediaState>((set, get) => ({
  tracks: {},
  pending: {},
  failed: false,

  toggle: async (kind) => {
    if (get().pending[kind]) {
      return;
    }

    set(({ pending }) => ({ pending: { ...pending, [kind]: true }, failed: false }));

    try {
      const current = get().tracks[kind];

      if (current) {
        await getSdkClient().deleteTrack(current);
        set(({ tracks }) => ({ tracks: { ...tracks, [kind]: undefined } }));
      } else {
        const track = await createTrack(kind);

        await track.publish();
        set(({ tracks }) => ({ tracks: { ...tracks, [kind]: track } }));
      }
    } catch {
      set({ failed: true });
    } finally {
      set(({ pending }) => ({ pending: { ...pending, [kind]: false } }));
    }
  },

  reset: () => set({ tracks: {}, pending: {}, failed: false }),
}));
