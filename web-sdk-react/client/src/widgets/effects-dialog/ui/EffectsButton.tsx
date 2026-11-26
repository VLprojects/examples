import type { Track } from '@livedigital/client';
import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  selectActiveTabs, usePreviewTrack, useVideoEffects, useVideoEffectsStore,
} from '@/features/video-effects';
import type { VideoEffectsSettings } from '@/features/video-effects';
import { Button, Dialog, IconButton } from '@/shared/ui';
import { EffectsPreview } from './EffectsPreview';
import { EffectsSettings } from './EffectsSettings';

interface EffectsButtonProps {
  cameraTrack: Track | undefined;
  isPublishing: boolean;
  displayName?: string;
}

const hasEffects = (settings: VideoEffectsSettings) => Object.values(selectActiveTabs(settings)).some(Boolean);

export function EffectsButton({ cameraTrack, isPublishing, displayName }: EffectsButtonProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const settings = useVideoEffectsStore((state) => state.settings);
  const draft = useVideoEffectsStore((state) => state.draft);
  const reset = useVideoEffectsStore((state) => state.reset);
  const apply = useVideoEffectsStore((state) => state.apply);
  const discard = useVideoEffectsStore((state) => state.discard);
  const isTryingOnOwnTrack = isOpen && !isPublishing;
  const dedicatedPreviewTrack = usePreviewTrack(isOpen && isPublishing && Boolean(cameraTrack));
  const previewTrack = isPublishing ? dedicatedPreviewTrack : cameraTrack;

  useVideoEffects(cameraTrack, isTryingOnOwnTrack ? draft : settings);
  useVideoEffects(dedicatedPreviewTrack, draft);

  const close = () => {
    discard();
    setIsOpen(false);
  };

  const confirm = () => {
    apply();
    setIsOpen(false);
  };

  return (
    <>
      <IconButton
        tone={hasEffects(settings) ? 'accent' : 'neutral'}
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
        actions={<Button disabled={!hasEffects(draft)} onClick={reset}>{t('effects.reset')}</Button>}
        footer={(
          <>
            <Button onClick={close}>{t('effects.cancel')}</Button>
            <Button variant="primary" disabled={draft === settings} onClick={confirm}>{t('effects.apply')}</Button>
          </>
        )}
        onClose={close}
      >
        <div className="effects">
          <EffectsPreview track={previewTrack} isCameraOn={Boolean(cameraTrack)} />
          <EffectsSettings displayName={displayName} />
        </div>
      </Dialog>
    </>
  );
}
