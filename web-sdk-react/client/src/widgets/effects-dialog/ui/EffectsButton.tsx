import type { Track } from '@livedigital/client';
import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { selectActiveTabs, useVideoEffects, useVideoEffectsStore } from '@/features/video-effects';
import { Button, Dialog, IconButton } from '@/shared/ui';
import { EffectsPreview } from './EffectsPreview';
import { EffectsSettings } from './EffectsSettings';

interface EffectsButtonProps {
  cameraTrack: Track | undefined;
  displayName?: string;
}

export function EffectsButton({ cameraTrack, displayName }: EffectsButtonProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const hasEffects = useVideoEffectsStore(({ settings }) => Object.values(selectActiveTabs(settings)).some(Boolean));
  const reset = useVideoEffectsStore((state) => state.reset);

  useVideoEffects(cameraTrack);

  return (
    <>
      <IconButton
        tone={hasEffects ? 'accent' : 'neutral'}
        label={t('effects.title')}
        aria-haspopup="dialog"
        onClick={() => setIsOpen(true)}
      >
        <Sparkles size={20} />
      </IconButton>
      <Dialog
        title={t('effects.title')}
        closeLabel={t('effects.close')}
        isOpen={isOpen}
        actions={<Button disabled={!hasEffects} onClick={reset}>{t('effects.reset')}</Button>}
        onClose={() => setIsOpen(false)}
      >
        <div className="effects">
          <EffectsPreview cameraTrack={cameraTrack} />
          <EffectsSettings displayName={displayName} />
        </div>
      </Dialog>
    </>
  );
}
