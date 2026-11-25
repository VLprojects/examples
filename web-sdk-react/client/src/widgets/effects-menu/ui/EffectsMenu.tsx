import type { Track } from '@livedigital/client';
import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NoiseSuppressionToggle, useNoiseSuppression } from '@/features/noise-suppression';
import { useVideoEffects, useVideoEffectsStore, VideoEffectsPicker } from '@/features/video-effects';
import { Popover } from '@/shared/ui';

interface EffectsMenuProps {
  cameraTrack: Track | undefined;
  publishedMicrophoneTrack?: Track;
}

export function EffectsMenu({ cameraTrack, publishedMicrophoneTrack }: EffectsMenuProps) {
  const { t } = useTranslation();
  const hasVideoEffects = useVideoEffectsStore(({ background, enhancements }) => (
    background !== 'none' || enhancements.length > 0
  ));

  useVideoEffects(cameraTrack);
  useNoiseSuppression(publishedMicrophoneTrack);

  return (
    <Popover label={t('effects.title')} icon={<Sparkles size={20} />} tone={hasVideoEffects ? 'accent' : 'neutral'}>
      <VideoEffectsPicker />
      <p className="effects-picker__title">{t('effects.audio')}</p>
      <NoiseSuppressionToggle />
      {!publishedMicrophoneTrack && <p className="effects-picker__status">{t('effects.noiseSuppressionHint')}</p>}
    </Popover>
  );
}
