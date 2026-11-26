import type { Track } from '@livedigital/client';
import { create } from 'zustand';
import { selectTrackConstraints, useDeviceStore } from '@/entities/device';
import { getSdkClient } from '@/shared/sdk';

export type PreviewKind = 'camera' | 'microphone';

const KINDS: PreviewKind[] = ['camera', 'microphone'];

interface PreviewState {
  enabled: Record<PreviewKind, boolean>;
  tracks: Partial<Record<PreviewKind, Track>>;
  failed: Partial<Record<PreviewKind, boolean>>;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  toggle: (kind: PreviewKind) => Promise<void>;
  restart: (kind: PreviewKind) => Promise<void>;
}

let queue = Promise.resolve();

const enqueue = (operation: () => Promise<void>): Promise<void> => {
  queue = queue.then(operation, operation);

  return queue;
};

const createPreviewTrack = (kind: PreviewKind): Promise<Track> => {
  const client = getSdkClient();
  const constraints = selectTrackConstraints(kind);

  return kind === 'camera'
    ? client.createCameraVideoTrack({ video: constraints, isPreview: true })
    : client.createMicrophoneAudioTrack({ audio: constraints, isPreview: true });
};

export const usePreviewStore = create<PreviewState>((set, get) => {
  const open = async (kind: PreviewKind) => {
    try {
      const track = await createPreviewTrack(kind);

      set(({ tracks, failed }) => ({ tracks: { ...tracks, [kind]: track }, failed: { ...failed, [kind]: false } }));
    } catch {
      set(({ enabled, failed }) => ({
        enabled: { ...enabled, [kind]: false },
        failed: { ...failed, [kind]: true },
      }));
    }
  };

  const close = async (kind: PreviewKind) => {
    const track = get().tracks[kind];

    if (!track) {
      return;
    }

    set(({ tracks }) => ({ tracks: { ...tracks, [kind]: undefined } }));
    await getSdkClient().deleteTrack(track);
  };

  return {
    enabled: { camera: true, microphone: true },
    tracks: {},
    failed: {},

    start: () => enqueue(async () => {
      await useDeviceStore.getState().detect().catch(() => undefined);

      for (const kind of KINDS) {
        if (get().enabled[kind] && !get().tracks[kind]) {
          await open(kind);
        }
      }
    }),

    stop: () => enqueue(async () => {
      for (const kind of KINDS) {
        await close(kind);
      }
    }),

    toggle: (kind) => enqueue(async () => {
      const isEnabled = !get().enabled[kind];

      set(({ enabled }) => ({ enabled: { ...enabled, [kind]: isEnabled } }));
      await (isEnabled ? open(kind) : close(kind));
    }),

    restart: (kind) => enqueue(async () => {
      if (get().enabled[kind]) {
        await close(kind);
        await open(kind);
      }
    }),
  };
});
