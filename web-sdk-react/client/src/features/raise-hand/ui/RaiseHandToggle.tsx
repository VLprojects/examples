import { useTranslation } from 'react-i18next';
import { useSessionStore } from '@/entities/session';
import { Button } from '@/shared/ui';

export function RaiseHandToggle() {
  const { t } = useTranslation();
  const isHandRaised = useSessionStore(({ appData }) => appData.isHandRaised === true);
  const updateAppData = useSessionStore((state) => state.updateAppData);

  return (
    <Button active={isHandRaised} onClick={() => void updateAppData({ isHandRaised: !isHandRaised })}>
      {t(isHandRaised ? 'room.lowerHand' : 'room.raiseHand')}
    </Button>
  );
}
