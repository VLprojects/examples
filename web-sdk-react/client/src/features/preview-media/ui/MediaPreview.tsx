import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DeviceControl } from '@/entities/device';
import { VideoView } from '@/shared/ui';
import { usePreviewStore } from '../model/store';
import type { PreviewKind } from '../model/store';

const KINDS: PreviewKind[] = ['camera', 'microphone'];

export function MediaPreview() {
  const { t } = useTranslation();
  const { enabled, tracks, failed, start, stop, toggle, restart } = usePreviewStore();

  useEffect(() => {
    void start();

    return () => {
      void stop();
    };
  }, [start, stop]);

  return (
    <section className="preview">
      {tracks.camera
        ? <VideoView track={tracks.camera.mediaStreamTrack} mirrored />
        : <p className="preview__placeholder">{t(failed.camera ? 'media.error' : 'lobby.cameraOff')}</p>}
      {failed.microphone && <p className="preview__notice">{t('media.error')}</p>}
      <div className="preview__controls">
        {KINDS.map((kind) => (
          <DeviceControl
            key={kind}
            kind={kind}
            isOn={enabled[kind]}
            microphoneTrack={tracks.microphone?.mediaStreamTrack}
            onToggle={() => void toggle(kind)}
            onDeviceChange={() => void restart(kind)}
          />
        ))}
      </div>
    </section>
  );
}
