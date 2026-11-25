import { useEffect, useReducer } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { DeviceControl } from '@/entities/device';
import { getSdkClient } from '@/shared/sdk';
import { VideoView } from '@/shared/ui';
import { usePreviewStore } from '../model/store';
import type { PreviewKind } from '../model/store';

const KINDS: PreviewKind[] = ['camera', 'microphone'];

const PROCESSED_TRACK_EVENTS = ['effects-enabled', 'effects-disabled'] as const;

interface MediaPreviewProps {
  extraControls?: ReactNode;
}

export function MediaPreview({ extraControls }: MediaPreviewProps) {
  const { t } = useTranslation();
  const { enabled, tracks, failed, start, stop, toggle, restart } = usePreviewStore();

  const [, rerender] = useReducer((revision: number) => revision + 1, 0);

  useEffect(() => {
    const { observer } = getSdkClient();

    PROCESSED_TRACK_EVENTS.forEach((event) => observer.on(event, rerender));

    return () => {
      PROCESSED_TRACK_EVENTS.forEach((event) => observer.off(event, rerender));
    };
  }, []);

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
        {extraControls}
      </div>
    </section>
  );
}
