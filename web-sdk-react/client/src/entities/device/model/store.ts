import type { AvailableMediaDevices, Client } from '@livedigital/client';
import { create } from 'zustand';
import { getSdkClient } from '@/shared/sdk';

export type DeviceKind = 'camera' | 'microphone' | 'speaker';

type SelectedDevices = Partial<Record<DeviceKind, string>>;

interface DeviceState {
  devices: AvailableMediaDevices | undefined;
  selected: SelectedDevices;
  detect: () => Promise<void>;
  select: (kind: DeviceKind, deviceId: string) => void;
}

const LIST_BY_KIND = { camera: 'video', microphone: 'audio', speaker: 'audioOutput' } as const;

const NO_DEVICES: MediaDeviceInfo[] = [];

export const listDevices = (devices: AvailableMediaDevices | undefined, kind: DeviceKind): MediaDeviceInfo[] => (
  devices?.[LIST_BY_KIND[kind]] ?? NO_DEVICES
);

const keepAvailable = (devices: AvailableMediaDevices, selected: SelectedDevices): SelectedDevices => (
  Object.fromEntries((Object.keys(LIST_BY_KIND) as DeviceKind[]).map((kind) => {
    const list = listDevices(devices, kind);
    const current = list.find(({ deviceId }) => deviceId === selected[kind]);

    return [kind, (current ?? list[0])?.deviceId];
  }))
);

export const useDeviceStore = create<DeviceState>((set, get) => ({
  devices: undefined,
  selected: {},

  detect: async () => {
    const devices = await getSdkClient().detectDevices();

    set({ devices, selected: keepAvailable(devices, get().selected) });
  },

  select: (kind, deviceId) => set(({ selected }) => ({ selected: { ...selected, [kind]: deviceId } })),
}));

export const bindDeviceEvents = (client: Client) => {
  client.observer.on('devices-list-updated', (devices) => {
    useDeviceStore.setState(({ selected }) => ({ devices, selected: keepAvailable(devices, selected) }));
  });
};
