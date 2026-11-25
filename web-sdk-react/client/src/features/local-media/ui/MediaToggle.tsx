import type { ReactNode } from 'react';
import { DeviceControl } from '@/entities/device';
import { useLocalMediaStore } from '../model/store';
import type { LocalMediaKind } from '../model/store';

interface MediaToggleProps {
  kind: LocalMediaKind;
  menuExtra?: ReactNode;
}

export function MediaToggle({ kind, menuExtra }: MediaToggleProps) {
  const isOn = useLocalMediaStore(({ enabled }) => enabled[kind]);
  const isPending = useLocalMediaStore(({ pending }) => Boolean(pending[kind]));
  const microphone = useLocalMediaStore(({ tracks }) => tracks.microphone);
  const toggle = useLocalMediaStore((state) => state.toggle);
  const changeDevice = useLocalMediaStore((state) => state.changeDevice);

  return (
    <DeviceControl
      kind={kind}
      isOn={isOn}
      disabled={isPending}
      microphoneTrack={microphone?.mediaStreamTrack}
      menuExtra={menuExtra}
      onToggle={() => void toggle(kind)}
      onDeviceChange={(deviceId) => void changeDevice(kind, deviceId)}
    />
  );
}
