import type { Client, Track } from '@livedigital/client';
import { create } from 'zustand';
import { selectTrackConstraints } from '@/entities/device';
import { useSessionStore } from '@/entities/session';
import { getSdkClient } from '@/shared/sdk';
import { showToast } from '@/shared/ui';

export type LocalMediaKind = 'camera' | 'microphone';

interface LocalMediaState {
  tracks: Partial<Record<LocalMediaKind, Track>>;
  enabled: Record<LocalMediaKind, boolean>;
  screenTracks: Track[];
  pending: Partial<Record<LocalMediaKind | 'screen', boolean>>;
  start: (initial: Record<LocalMediaKind, boolean>) => Promise<void>;
  toggle: (kind: LocalMediaKind) => Promise<void>;
  changeDevice: (kind: LocalMediaKind, deviceId: string) => Promise<void>;
  toggleScreen: () => Promise<void>;
  reset: () => void;
}

const INITIAL_STATE = {
  tracks: {},
  enabled: { camera: false, microphone: false },
  screenTracks: [],
  pending: {},
};

const createTrack = (kind: LocalMediaKind): Promise<Track> => {
  const client = getSdkClient();
  const constraints = selectTrackConstraints(kind);

  return kind === 'camera'
    ? client.createCameraVideoTrack({ video: constraints, stopTrackOnPause: true })
    : client.createMicrophoneAudioTrack({ audio: constraints });
};

export const useLocalMediaStore = create<LocalMediaState>((set, get) => {
  const guard = async (key: LocalMediaKind | 'screen', operation: () => Promise<void>) => {
    if (get().pending[key]) {
      return;
    }

    set(({ pending }) => ({ pending: { ...pending, [key]: true } }));

    try {
      await operation();
    } catch {
      showToast('media.error', { tone: 'error' });
    } finally {
      set(({ pending }) => ({ pending: { ...pending, [key]: false } }));
    }
  };

  const setEnabled = (kind: LocalMediaKind, value: boolean) => (
    set(({ enabled }) => ({ enabled: { ...enabled, [kind]: value } }))
  );

  const stopScreen = async () => {
    const { screenTracks } = get();

    set({ screenTracks: [] });
    await Promise.all(screenTracks.map((track) => getSdkClient().deleteTrack(track)));
    useSessionStore.getState().refreshPresenter();
  };

  const toggle = (kind: LocalMediaKind) => guard(kind, async () => {
    const track = get().tracks[kind];

    if (!track) {
      const created = await createTrack(kind);

      await created.publish();
      set(({ tracks }) => ({ tracks: { ...tracks, [kind]: created } }));
      setEnabled(kind, true);
    } else if (get().enabled[kind]) {
      await track.pause();
      setEnabled(kind, false);
    } else {
      await track.resume();
      setEnabled(kind, true);
    }
  });

  return {
    ...INITIAL_STATE,
    toggle,

    start: async (initial) => {
      await Promise.all((Object.keys(initial) as LocalMediaKind[]).filter((kind) => initial[kind]).map(toggle));
    },

    changeDevice: (kind, deviceId) => guard(kind, async () => {
      await get().tracks[kind]?.changeDevice(deviceId);
    }),

    toggleScreen: () => guard('screen', async () => {
      if (get().screenTracks.length > 0) {
        await stopScreen();

        return;
      }

      const screenTracks = await getSdkClient().createScreenMediaTracks({
        video: { frameRate: { ideal: 15, max: 30 } },
        audio: true,
      });

      set({ screenTracks });
      screenTracks
        .find(({ kind }) => kind === 'video')
        ?.mediaStreamTrack.addEventListener('ended', () => void stopScreen(), { once: true });

      await Promise.all(screenTracks.map((track) => track.publish()));
      useSessionStore.getState().refreshPresenter();
    }),

    reset: () => set(INITIAL_STATE),
  };
});

export const bindLocalMediaEvents = (client: Client) => {
  const dropTrack = ({ label }: { label: string }) => {
    if (label !== 'camera' && label !== 'microphone') {
      return;
    }

    useLocalMediaStore.setState(({ tracks, enabled }) => ({
      tracks: { ...tracks, [label]: undefined },
      enabled: { ...enabled, [label]: false },
    }));
  };

  client.observer.on('track-failed', dropTrack);
  client.observer.on('track-force-closed', dropTrack);
};
