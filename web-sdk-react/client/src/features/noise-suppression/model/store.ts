import type { Client } from '@livedigital/client';
import { create } from 'zustand';
import { showToast } from '@/shared/ui';

const STORAGE_KEY = 'sdk-demo:noise-suppression';

interface NoiseSuppressionState {
  isEnabled: boolean;
  isInitializing: boolean;
  toggle: () => void;
}

export const useNoiseSuppressionStore = create<NoiseSuppressionState>((set) => ({
  isEnabled: localStorage.getItem(STORAGE_KEY) !== 'off',
  isInitializing: false,

  toggle: () => set(({ isEnabled }) => {
    localStorage.setItem(STORAGE_KEY, isEnabled ? 'off' : 'on');

    return { isEnabled: !isEnabled };
  }),
}));

export const bindNoiseSuppressionEvents = (client: Client) => {
  client.observer.on('denoiser-initializing', (isInitializing) => {
    useNoiseSuppressionStore.setState({ isInitializing });
  });

  client.observer.on('denoiser-failed', () => {
    useNoiseSuppressionStore.setState({ isEnabled: false });
    showToast('effects.noiseSuppressionFailed', { tone: 'error' });
  });
};
