import { X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSessionStore } from '@/entities/session';
import { useLocalMediaStore } from '@/features/local-media';
import { useNoiseSuppression } from '@/features/noise-suppression';
import { IconButton } from '@/shared/ui';
import { ControlBar } from '@/widgets/control-bar';
import type { SidePanel } from '@/widgets/control-bar';
import { DevPanel } from '@/widgets/dev-panel';
import { EffectsButton } from '@/widgets/effects-dialog';
import { ParticipantList } from '@/widgets/participant-list';
import { Stage } from '@/widgets/stage';

export function CallView() {
  const { t } = useTranslation();
  const isReconnecting = useSessionStore((state) => state.status === 'reconnecting');
  const peerCount = useSessionStore((state) => state.peers.length);
  const tracks = useLocalMediaStore((state) => state.tracks);
  const displayName = useSessionStore(({ appData }) => appData.displayName);
  const [sidePanel, setSidePanel] = useState<SidePanel>();
  const [isDevMode, setIsDevMode] = useState(false);

  const toggleSidePanel = (panel: SidePanel) => {
    const isClosing = sidePanel === panel;

    if (panel === 'dev') {
      setIsDevMode(!isClosing);
    }

    setSidePanel(isClosing ? undefined : panel);
  };

  useNoiseSuppression(tracks.microphone);

  return (
    <div className="call">
      {isReconnecting && <div className="status-banner">{t('room.status.reconnecting')}</div>}
      <div className="call__body">
        <main className="call__stage">
          <Stage isDevMode={isDevMode} />
        </main>
        {sidePanel && (
          <aside className={`side-panel side-panel--${sidePanel}`}>
            <header className="side-panel__header">
              <h2>{sidePanel === 'dev' ? t('dev.title') : t('room.participantCount', { count: peerCount })}</h2>
              <IconButton size="small" label={t('room.closePanel')} onClick={() => setSidePanel(undefined)}>
                <X size={16} />
              </IconButton>
            </header>
            {sidePanel === 'dev' ? <DevPanel /> : <ParticipantList />}
          </aside>
        )}
      </div>
      <ControlBar
        sidePanel={sidePanel}
        isDevMode={isDevMode}
        onToggleSidePanel={toggleSidePanel}
        extraControls={<EffectsButton cameraTrack={tracks.camera} isPublishing displayName={typeof displayName === 'string' ? displayName : undefined} />}
      />
    </div>
  );
}
