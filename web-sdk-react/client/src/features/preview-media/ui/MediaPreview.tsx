import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { DeviceControl } from '@/entities/device';
import { useMediaStreamTrack } from '@/shared/sdk';
import { VideoView } from '@/shared/ui';
import { usePreviewStore } from '../model/store';
import type { PreviewKind } from '../model/store';

const KINDS: PreviewKind[] = ['camera', 'microphone'];

interface MediaPreviewProps {
  extraControls?: ReactNode;
  microphoneMenuExtra?: ReactNode;
}

export function MediaPreview({ extraControls, microphoneMenuExtra }: MediaPreviewProps) {
  const { t } = useTranslation();
  const { enabled, tracks, failed, start, stop, toggle, restart } = usePreviewStore();
  const cameraTrack = useMediaStreamTrack(tracks.camera);

  useEffect(() => {
    void start();

    return () => {
      void stop();
    };
  }, [start, stop]);

  return (
    <section className="preview">
      {cameraTrack
        ? <VideoView track={cameraTrack} mirrored />
        : <p className="preview__placeholder">{t(failed.camera ? 'media.error' : 'lobby.cameraOff')}</p>}
      {failed.microphone && <p className="preview__notice">{t('media.error')}</p>}
      <div className="preview__controls">
        {KINDS.map((kind) => (
          <DeviceControl
            key={kind}
            kind={kind}
            isOn={enabled[kind]}
            microphoneTrack={tracks.microphone?.mediaStreamTrack}
            menuExtra={kind === 'microphone' && microphoneMenuExtra}
            onToggle={() => void toggle(kind)}
            onDeviceChange={() => void restart(kind)}
          />
        ))}
        {extraControls}
      </div>
    </section>
  );
}
