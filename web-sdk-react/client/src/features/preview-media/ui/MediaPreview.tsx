import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DeviceSelect } from '@/entities/device';
import { Button, LevelMeter, VideoView } from '@/shared/ui';
import { usePreviewStore } from '../model/store';
import type { PreviewKind } from '../model/store';

const KINDS: PreviewKind[] = ['microphone', 'camera'];

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
    <section className="card preview">
      <div className="preview__video">
        {tracks.camera
          ? <VideoView track={tracks.camera.mediaStreamTrack} mirrored />
          : <p className="preview__placeholder">{t(failed.camera ? 'media.error' : 'lobby.cameraOff')}</p>}
      </div>
      {tracks.microphone && <LevelMeter track={tracks.microphone.mediaStreamTrack} />}
      {failed.microphone && <p className="error">{t('media.error')}</p>}
      <div className="preview__toggles">
        {KINDS.map((kind) => (
          <Button key={kind} active={enabled[kind]} onClick={() => void toggle(kind)}>
            {t(`media.${kind}${enabled[kind] ? 'Off' : 'On'}`)}
          </Button>
        ))}
      </div>
      <DeviceSelect kind="camera" onSelect={() => void restart('camera')} />
      <DeviceSelect kind="microphone" onSelect={() => void restart('microphone')} />
      <DeviceSelect kind="speaker" />
    </section>
  );
}
