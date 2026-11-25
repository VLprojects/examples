import { ScreenShare, ScreenShareOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { IconButton } from '@/shared/ui';
import { useLocalMediaStore } from '../model/store';

const isScreenShareSupported = Boolean(navigator.mediaDevices?.getDisplayMedia);

export function ScreenShareToggle() {
  const { t } = useTranslation();
  const isOn = useLocalMediaStore(({ screenTracks }) => screenTracks.length > 0);
  const isPending = useLocalMediaStore(({ pending }) => Boolean(pending.screen));
  const toggleScreen = useLocalMediaStore((state) => state.toggleScreen);

  if (!isScreenShareSupported) {
    return null;
  }

  return (
    <IconButton
      tone={isOn ? 'accent' : 'neutral'}
      label={t(isOn ? 'media.screenOff' : 'media.screenOn')}
      disabled={isPending}
      onClick={() => void toggleScreen()}
    >
      {isOn ? <ScreenShareOff size={20} /> : <ScreenShare size={20} />}
    </IconButton>
  );
}
