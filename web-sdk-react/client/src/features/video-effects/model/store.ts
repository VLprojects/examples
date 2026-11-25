import type { Client, Effects, VideoTrack } from '@livedigital/client';
import { create } from 'zustand';
import { showToast } from '@/shared/ui';
import { loadEffectsSdk } from './sdk';

export const BACKGROUNDS = {
  none: {},
  blurLight: { blur: 0.4 },
  blurStrong: { blur: 0.9 },
  slate: { backgroundColor: 0x2c3e50 },
  sage: { backgroundColor: 0x5b7f6b },
} satisfies Record<string, Effects>;

export const ENHANCEMENTS = {
  beautification: { beautification: 0.5 },
  lowLight: { lowLightEffect: 0.6 },
  colorCorrection: { colorCorrector: 0.5 },
} satisfies Record<string, Effects>;

export type BackgroundId = keyof typeof BACKGROUNDS | 'image';
export type EnhancementId = keyof typeof ENHANCEMENTS;

interface VideoEffectsState {
  status: 'idle' | 'loading' | 'ready' | 'failed';
  background: BackgroundId;
  imageUrl: string | undefined;
  enhancements: EnhancementId[];
  setBackground: (background: BackgroundId) => void;
  setImage: (file: File) => void;
  toggleEnhancement: (enhancement: EnhancementId) => void;
}

export const useVideoEffectsStore = create<VideoEffectsState>((set) => ({
  status: 'idle',
  background: 'none',
  imageUrl: undefined,
  enhancements: [],

  setBackground: (background) => set({ background }),

  setImage: (file) => set(({ imageUrl }) => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }

    return { background: 'image', imageUrl: URL.createObjectURL(file) };
  }),

  toggleEnhancement: (enhancement) => set(({ enhancements }) => ({
    enhancements: enhancements.includes(enhancement)
      ? enhancements.filter((item) => item !== enhancement)
      : [...enhancements, enhancement],
  })),
}));

export const selectEffects = ({ background, imageUrl, enhancements }: VideoEffectsState): Effects => Object.assign(
  {},
  background === 'image' ? { background: imageUrl } : BACKGROUNDS[background],
  ...enhancements.map((enhancement) => ENHANCEMENTS[enhancement]),
);

let queue = Promise.resolve();

export const applyVideoEffects = (track: VideoTrack, effects: Effects) => {
  queue = queue.then(async () => {
    if (Object.keys(effects).length === 0) {
      await track.disableEffects();

      return;
    }

    if (useVideoEffectsStore.getState().status !== 'ready') {
      useVideoEffectsStore.setState({ status: 'loading' });
      await loadEffectsSdk();
      useVideoEffectsStore.setState({ status: 'ready' });
    }

    await track.applyEffects(effects);
  }).catch(() => {
    useVideoEffectsStore.setState({ status: 'failed', background: 'none', enhancements: [] });
    showToast('effects.failed', { tone: 'error' });
  });
};

export const bindVideoEffectsEvents = (client: Client) => {
  client.observer.on('effects-failed', ({ operation }) => {
    if (operation === 'enable') {
      useVideoEffectsStore.setState({ status: 'failed', background: 'none', enhancements: [] });
      showToast('effects.failed', { tone: 'error' });
    }
  });
};
