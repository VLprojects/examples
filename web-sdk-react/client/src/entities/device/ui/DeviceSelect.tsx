import { useTranslation } from 'react-i18next';
import { listDevices, useDeviceStore } from '../model/store';
import type { DeviceKind } from '../model/store';

interface DeviceSelectProps {
  kind: DeviceKind;
  onSelect?: (deviceId: string) => void;
}

const isSpeakerSelectionSupported = 'setSinkId' in HTMLMediaElement.prototype;

export function DeviceSelect({ kind, onSelect }: DeviceSelectProps) {
  const { t } = useTranslation();
  const devices = useDeviceStore((state) => listDevices(state.devices, kind));
  const selected = useDeviceStore((state) => state.selected[kind]);
  const select = useDeviceStore((state) => state.select);

  if (kind === 'speaker' && !isSpeakerSelectionSupported) {
    return null;
  }

  return (
    <label className="field">
      <span>{t(`devices.${kind}`)}</span>
      <select
        value={selected ?? ''}
        disabled={devices.length === 0}
        onChange={(event) => {
          select(kind, event.target.value);
          onSelect?.(event.target.value);
        }}
      >
        {devices.length === 0 && <option value="">{t('devices.none')}</option>}
        {devices.map(({ deviceId, label }, index) => (
          <option key={deviceId} value={deviceId}>{label || `${t(`devices.${kind}`)} ${index + 1}`}</option>
        ))}
      </select>
    </label>
  );
}
