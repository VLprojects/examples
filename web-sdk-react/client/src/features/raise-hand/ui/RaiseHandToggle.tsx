import { Hand } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSessionStore } from '@/entities/session';
import { IconButton } from '@/shared/ui';

export function RaiseHandToggle() {
  const { t } = useTranslation();
  const isHandRaised = useSessionStore(({ appData }) => appData.isHandRaised === true);
  const updateAppData = useSessionStore((state) => state.updateAppData);

  return (
    <IconButton
      tone={isHandRaised ? 'accent' : 'neutral'}
      label={t(isHandRaised ? 'room.lowerHand' : 'room.raiseHand')}
      onClick={() => void updateAppData({ isHandRaised: !isHandRaised })}
    >
      <Hand size={20} />
    </IconButton>
  );
}
