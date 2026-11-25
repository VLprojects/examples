import { ChevronUp, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { IconButton, LevelMeter, Popover } from '@/shared/ui';
import { DeviceList } from './DeviceList';

interface DeviceControlProps {
  kind: 'camera' | 'microphone';
  isOn: boolean;
  disabled?: boolean;
  microphoneTrack?: MediaStreamTrack;
  onToggle: () => void;
  onDeviceChange: (deviceId: string) => void;
}

const ICONS = {
  microphone: { on: Mic, off: MicOff },
  camera: { on: Video, off: VideoOff },
};

export function DeviceControl({ kind, isOn, disabled, microphoneTrack, onToggle, onDeviceChange }: DeviceControlProps) {
  const { t } = useTranslation();
  const Icon = ICONS[kind][isOn ? 'on' : 'off'];
  const levelTrack = kind === 'microphone' && isOn ? microphoneTrack : undefined;

  return (
    <div className="split-button">
      <IconButton
        tone={isOn ? 'neutral' : 'danger'}
        label={t(`media.${kind}${isOn ? 'Off' : 'On'}`)}
        disabled={disabled}
        onClick={onToggle}
      >
        {levelTrack && <LevelMeter track={levelTrack} vertical />}
        <Icon size={20} />
      </IconButton>
      <Popover className="split-button__more" label={t(`media.${kind}Devices`)} icon={<ChevronUp size={14} />}>
        <DeviceList kind={kind} onSelect={onDeviceChange} />
        {kind === 'microphone' && (
          <>
            {levelTrack && <LevelMeter track={levelTrack} />}
            <DeviceList kind="speaker" />
          </>
        )}
      </Popover>
    </div>
  );
}
