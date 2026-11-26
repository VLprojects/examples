import type { IceTransportPolicy } from '@livedigital/client';
import { create } from 'zustand';
import { getSdkClient } from '@/shared/sdk';

interface IcePolicyState {
  policy: IceTransportPolicy;
  change: (policy: IceTransportPolicy) => Promise<void>;
}

export const useIcePolicyStore = create<IcePolicyState>((set) => ({
  policy: 'all',

  change: async (policy) => {
    await getSdkClient().changeIceTransportPolicy(policy);
    set({ policy });
  },
}));
