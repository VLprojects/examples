import type { Client, Effects, LayoutTypes, VideoTrack } from '@livedigital/client';
import { create } from 'zustand';
import { loadEffectsSdk } from './sdk';

export const BACKGROUND_IMAGES = ['dawn', 'ocean', 'forest', 'graphite'] as const;
export const BACKGROUND_COLORS = ['#2c3e50', '#5b7f6b', '#7a4b3a', '#3d3a6b', '#1f1f24'];
export const COLOR_FILTERS = ['warm', 'cool', 'vivid', 'mono'] as const;
export const LAYOUTS: LayoutTypes[] = ['left-bottom', 'center', 'right-bottom'];
export const LOWER_THIRD_TYPES = ['lowerthird_1', 'lowerthird_2', 'lowerthird_3', 'lowerthird_4', 'lowerthird_5'] as const;
export const LOWER_THIRD_PLACEMENTS = ['bottom-left', 'bottom-right', 'top-left', 'top-right'] as const;

type LowerThird = NonNullable<Effects['lowerThird']>;

export type BackgroundKind = 'none' | 'blur' | 'color' | 'image';
export type ColorFilter = typeof COLOR_FILTERS[number];
export type LowerThirdPlacement = typeof LOWER_THIRD_PLACEMENTS[number];
export type EffectsTab = 'background' | 'picture' | 'frame';

export interface VideoEffectsSettings {
  background: BackgroundKind;
  blur: number;
  color: string;
  imageUrl: string;
  layout: LayoutTypes;
  beautification: number;
  lowLight: number;
  colorCorrection: number;
  sharpness: number;
  colorFilter: ColorFilter | undefined;
  colorFilterPower: number;
  smartZoom: number;
  isLowerThirdOn: boolean;
  lowerThirdType: LowerThird['type'];
  lowerThirdTitle: string;
  lowerThirdSubtitle: string;
  lowerThirdPlacement: LowerThirdPlacement;
  lowerThirdColor: string;
}

const DEFAULT_SETTINGS: VideoEffectsSettings = {
  background: 'none',
  blur: 0.6,
  color: BACKGROUND_COLORS[0],
  imageUrl: `/backgrounds/${BACKGROUND_IMAGES[0]}.jpg`,
  layout: 'center',
  beautification: 0,
  lowLight: 0,
  colorCorrection: 0,
  sharpness: 0,
  colorFilter: undefined,
  colorFilterPower: 0.7,
  smartZoom: 0,
  isLowerThirdOn: false,
  lowerThirdType: 'lowerthird_1',
  lowerThirdTitle: '',
  lowerThirdSubtitle: '',
  lowerThirdPlacement: 'bottom-left',
  lowerThirdColor: '#4560f0',
};

interface VideoEffectsState {
  status: 'idle' | 'loading' | 'ready' | 'failed';
  attempt: number;
  uploadedImageUrl: string | undefined;
  settings: VideoEffectsSettings;
  draft: VideoEffectsSettings;
  update: (patch: Partial<VideoEffectsSettings>) => void;
  uploadImage: (file: File) => void;
  reset: () => void;
  apply: () => void;
  discard: () => void;
  retry: () => void;
}

export const useVideoEffectsStore = create<VideoEffectsState>((set) => ({
  status: 'idle',
  attempt: 0,
  uploadedImageUrl: undefined,
  settings: DEFAULT_SETTINGS,
  draft: DEFAULT_SETTINGS,

  update: (patch) => set(({ draft }) => ({ draft: { ...draft, ...patch } })),

  uploadImage: (file) => set(({ draft, uploadedImageUrl }) => {
    if (uploadedImageUrl) {
      URL.revokeObjectURL(uploadedImageUrl);
    }

    const imageUrl = URL.createObjectURL(file);

    return { uploadedImageUrl: imageUrl, draft: { ...draft, background: 'image', imageUrl } };
  }),

  reset: () => set({ draft: DEFAULT_SETTINGS }),

  apply: () => set(({ draft }) => ({ settings: draft })),

  discard: () => set(({ settings }) => ({ draft: settings })),

  retry: () => set(({ attempt }) => ({ attempt: attempt + 1 })),
}));

const toColorNumber = (hex: string) => Number.parseInt(hex.slice(1), 16);

const toAbsoluteUrl = (url: string) => new URL(url, window.location.origin).href;

const selectBackground = ({ background, blur, color, imageUrl }: VideoEffectsSettings): Effects => {
  switch (background) {
    case 'blur':
      return { blur };
    case 'color':
      return { backgroundColor: toColorNumber(color) };
    case 'image':
      return { background: toAbsoluteUrl(imageUrl) };
    default:
      return {};
  }
};

const selectLowerThird = (settings: VideoEffectsSettings): Effects => (settings.isLowerThirdOn ? {
  lowerThird: {
    type: settings.lowerThirdType,
    options: {
      position: { placement: settings.lowerThirdPlacement },
      color: { primary: toColorNumber(settings.lowerThirdColor) },
      text: { title: settings.lowerThirdTitle, subtitle: settings.lowerThirdSubtitle },
    },
  },
} : {});

export const selectEffects = (settings: VideoEffectsSettings): Effects => {
  const background = selectBackground(settings);
  const hasBackground = settings.background !== 'none';

  return {
    ...background,
    ...(hasBackground && settings.layout !== 'center' && { layout: settings.layout }),
    ...(settings.beautification && { beautification: settings.beautification }),
    ...(settings.lowLight && { lowLightEffect: settings.lowLight }),
    ...(settings.colorCorrection && { colorCorrector: settings.colorCorrection }),
    ...(settings.sharpness && { sharpness: settings.sharpness }),
    ...(settings.smartZoom && { smartZoom: settings.smartZoom }),
    ...(settings.colorFilter && {
      colorFilter: { url: toAbsoluteUrl(`/luts/${settings.colorFilter}.cube`), power: settings.colorFilterPower },
    }),
    ...selectLowerThird(settings),
  };
};

export const selectActiveTabs = (settings: VideoEffectsSettings): Record<EffectsTab, boolean> => ({
  background: settings.background !== 'none',
  picture: Boolean(
    settings.beautification || settings.lowLight || settings.colorCorrection || settings.sharpness || settings.colorFilter,
  ),
  frame: Boolean(settings.smartZoom) || settings.isLowerThirdOn,
});

const SETTLE_MS = 150;

const pending = new Map<VideoTrack, Effects>();
let queue = Promise.resolve();

const applyPending = async (track: VideoTrack) => {
  if (!pending.has(track)) {
    return;
  }

  await new Promise((resolve) => {
    setTimeout(resolve, SETTLE_MS);
  });

  const effects = pending.get(track) ?? {};

  pending.delete(track);

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
};

export const applyVideoEffects = (track: VideoTrack, effects: Effects) => {
  pending.set(track, effects);
  queue = queue
    .then(() => applyPending(track))
    .catch(() => useVideoEffectsStore.setState({ status: 'failed' }));
};

export const bindVideoEffectsEvents = (client: Client) => {
  client.observer.on('effects-failed', ({ operation }) => {
    if (operation !== 'disable') {
      useVideoEffectsStore.setState({ status: 'failed' });
    }
  });
};
