import { Pin, PinOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { IconButton } from '@/shared/ui';
import { usePinStore } from '../model/store';

interface PinToggleProps {
  peerId: string;
}

export function PinToggle({ peerId }: PinToggleProps) {
  const { t } = useTranslation();
  const isPinned = usePinStore((state) => state.pinnedPeerId === peerId);
  const toggle = usePinStore((state) => state.toggle);

  return (
    <IconButton
      size="small"
      tone={isPinned ? 'accent' : 'neutral'}
      label={t(isPinned ? 'room.unpin' : 'room.pin')}
      onClick={() => toggle(peerId)}
    >
      {isPinned ? <PinOff size={16} /> : <Pin size={16} />}
    </IconButton>
  );
}
