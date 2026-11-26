import type { Track } from '@livedigital/client';
import { useTranslation } from 'react-i18next';
import { useVideoEffectsStore } from '@/features/video-effects';
import { useMediaStreamTrack } from '@/shared/sdk';
import { Button, VideoView } from '@/shared/ui';

interface EffectsPreviewProps {
  track: Track | undefined;
  isCameraOn: boolean;
}

export function EffectsPreview({ track, isCameraOn }: EffectsPreviewProps) {
  const { t } = useTranslation();
  const mediaStreamTrack = useMediaStreamTrack(track);
  const status = useVideoEffectsStore((state) => state.status);
  const retry = useVideoEffectsStore((state) => state.retry);

  return (
    <div className="effects__preview">
      {mediaStreamTrack
        ? <VideoView track={mediaStreamTrack} contain />
        : <p className="effects__placeholder">{t(isCameraOn ? 'effects.previewStarting' : 'effects.cameraOff')}</p>}
      {mediaStreamTrack && <p className="effects__caption">{t('effects.previewCaption')}</p>}
      {status === 'loading' && <p className="effects__status" role="status">{t('effects.loading')}</p>}
      {status === 'failed' && (
        <div className="effects__status" role="alert">
          <span>{t('effects.failed')}</span>
          <Button onClick={retry}>{t('effects.retry')}</Button>
        </div>
      )}
    </div>
  );
}
