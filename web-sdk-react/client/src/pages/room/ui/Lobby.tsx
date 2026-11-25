import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useSessionStore } from '@/entities/session';
import { JoinRoomForm } from '@/features/join-room';
import { useLocalMediaStore } from '@/features/local-media';
import { NoiseSuppressionToggle } from '@/features/noise-suppression';
import { MediaPreview, usePreviewStore } from '@/features/preview-media';
import { EffectsButton } from '@/widgets/effects-dialog';

interface LobbyProps {
  alias?: string;
}

export function Lobby({ alias }: LobbyProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const hasJoinFailed = useSessionStore((state) => state.status === 'error');
  const startPreview = usePreviewStore((state) => state.start);
  const stopPreview = usePreviewStore((state) => state.stop);
  const previewCamera = usePreviewStore((state) => state.tracks.camera);
  const startLocalMedia = useLocalMediaStore((state) => state.start);

  useEffect(() => {
    if (hasJoinFailed) {
      void startPreview();
    }
  }, [hasJoinFailed, startPreview]);

  return (
    <div className="lobby">
      <h1>{t(alias ? 'join.headingJoin' : 'join.headingStart')}</h1>
      <MediaPreview
        extraControls={<EffectsButton cameraTrack={previewCamera} />}
        microphoneMenuExtra={<NoiseSuppressionToggle isPublishing={false} />}
      />
      <JoinRoomForm
        alias={alias}
        onRoomCreated={(createdAlias) => void navigate(`/r/${createdAlias}`, { replace: true })}
        beforeJoin={stopPreview}
        afterJoin={() => startLocalMedia(usePreviewStore.getState().enabled)}
      />
    </div>
  );
}
