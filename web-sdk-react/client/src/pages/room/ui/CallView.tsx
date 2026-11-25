import { X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSessionStore } from '@/entities/session';
import { useLocalMediaStore } from '@/features/local-media';
import { IconButton } from '@/shared/ui';
import { ControlBar } from '@/widgets/control-bar';
import { EffectsMenu } from '@/widgets/effects-menu';
import { ParticipantList } from '@/widgets/participant-list';
import { Stage } from '@/widgets/stage';

export function CallView() {
  const { t } = useTranslation();
  const isReconnecting = useSessionStore((state) => state.status === 'reconnecting');
  const peerCount = useSessionStore((state) => state.peers.length);
  const tracks = useLocalMediaStore((state) => state.tracks);
  const [areParticipantsOpen, setAreParticipantsOpen] = useState(false);

  return (
    <div className="call">
      {isReconnecting && <div className="status-banner">{t('room.status.reconnecting')}</div>}
      <div className="call__body">
        <main className="call__stage">
          <Stage />
        </main>
        {areParticipantsOpen && (
          <aside className="side-panel">
            <header className="side-panel__header">
              <h2>{t('room.participantCount', { count: peerCount })}</h2>
              <IconButton size="small" label={t('room.closePanel')} onClick={() => setAreParticipantsOpen(false)}>
                <X size={16} />
              </IconButton>
            </header>
            <ParticipantList />
          </aside>
        )}
      </div>
      <ControlBar
        areParticipantsOpen={areParticipantsOpen}
        onToggleParticipants={() => setAreParticipantsOpen(!areParticipantsOpen)}
        extraControls={<EffectsMenu cameraTrack={tracks.camera} publishedMicrophoneTrack={tracks.microphone} />}
      />
    </div>
  );
}
