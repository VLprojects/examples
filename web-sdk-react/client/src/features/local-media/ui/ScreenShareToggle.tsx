import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui';
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
    <Button active={isOn} disabled={isPending} onClick={() => void toggleScreen()}>
      {t(isOn ? 'media.screenOff' : 'media.screenOn')}
    </Button>
  );
}
