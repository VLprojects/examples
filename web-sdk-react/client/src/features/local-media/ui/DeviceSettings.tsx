import { DeviceSelect } from '@/entities/device';
import { useLocalMediaStore } from '../model/store';

export function DeviceSettings() {
  const changeDevice = useLocalMediaStore((state) => state.changeDevice);

  return (
    <div className="device-settings">
      <DeviceSelect kind="camera" onSelect={(deviceId) => void changeDevice('camera', deviceId)} />
      <DeviceSelect kind="microphone" onSelect={(deviceId) => void changeDevice('microphone', deviceId)} />
      <DeviceSelect kind="speaker" />
    </div>
  );
}
