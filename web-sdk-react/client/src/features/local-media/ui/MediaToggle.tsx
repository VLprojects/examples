import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui';
import { useLocalMediaStore } from '../model/store';
import type { LocalMediaKind } from '../model/store';

interface MediaToggleProps {
  kind: LocalMediaKind;
}

export function MediaToggle({ kind }: MediaToggleProps) {
  const { t } = useTranslation();
  const isOn = useLocalMediaStore(({ tracks }) => Boolean(tracks[kind]));
  const isPending = useLocalMediaStore(({ pending }) => Boolean(pending[kind]));
  const toggle = useLocalMediaStore((state) => state.toggle);

  return (
    <Button active={isOn} disabled={isPending} onClick={() => void toggle(kind)}>
      {t(`media.${kind}${isOn ? 'Off' : 'On'}`)}
    </Button>
  );
}
