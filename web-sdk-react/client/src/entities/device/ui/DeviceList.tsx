import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { listDevices, useDeviceStore } from '../model/store';
import type { DeviceKind } from '../model/store';

interface DeviceListProps {
  kind: DeviceKind;
  onSelect?: (deviceId: string) => void;
}

const isSpeakerSelectionSupported = 'setSinkId' in HTMLMediaElement.prototype;

export function DeviceList({ kind, onSelect }: DeviceListProps) {
  const { t } = useTranslation();
  const devices = useDeviceStore((state) => listDevices(state.devices, kind));
  const selected = useDeviceStore((state) => state.selected[kind]);
  const select = useDeviceStore((state) => state.select);

  if (kind === 'speaker' && !isSpeakerSelectionSupported) {
    return null;
  }

  return (
    <div className="device-list" role="radiogroup" aria-label={t(`devices.${kind}`)}>
      <p className="device-list__title">{t(`devices.${kind}`)}</p>
      {devices.length === 0 && <p className="device-list__empty">{t('devices.none')}</p>}
      {devices.map(({ deviceId, label }, index) => (
        <button
          key={deviceId}
          type="button"
          role="radio"
          aria-checked={deviceId === selected}
          className="device-list__item"
          onClick={() => {
            select(kind, deviceId);
            onSelect?.(deviceId);
          }}
        >
          <Check size={16} className="device-list__check" />
          <span>{label || `${t(`devices.${kind}`)} ${index + 1}`}</span>
        </button>
      ))}
    </div>
  );
}
