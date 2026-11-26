import { CodeXml, PhoneOff, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { useSessionStore } from '@/entities/session';
import { CopyLinkButton } from '@/features/copy-invite-link';
import { MediaToggle, ScreenShareToggle, useLocalMediaStore } from '@/features/local-media';
import { NetworkQualityIndicator } from '@/features/network-quality';
import { NoiseSuppressionToggle } from '@/features/noise-suppression';
import { RaiseHandToggle } from '@/features/raise-hand';
import { IconButton } from '@/shared/ui';

export type SidePanel = 'participants' | 'dev';

interface ControlBarProps {
  sidePanel: SidePanel | undefined;
  isDevMode: boolean;
  onToggleSidePanel: (panel: SidePanel) => void;
  extraControls?: ReactNode;
}

export function ControlBar({ sidePanel, isDevMode, onToggleSidePanel, extraControls }: ControlBarProps) {
  const { t } = useTranslation();
  const { alias } = useParams();
  const peerCount = useSessionStore((state) => state.peers.length);
  const disconnect = useSessionStore((state) => state.disconnect);
  const resetLocalMedia = useLocalMediaStore((state) => state.reset);

  const leave = async () => {
    await disconnect();
    resetLocalMedia();
  };

  return (
    <footer className="control-bar">
      <div className="control-bar__room">
        <span className="control-bar__alias">{alias}</span>
        <CopyLinkButton compact />
        <NetworkQualityIndicator />
      </div>
      <div className="control-bar__media">
        <MediaToggle kind="camera" />
        <MediaToggle kind="microphone" menuExtra={<NoiseSuppressionToggle isPublishing />} />
        {extraControls}
        <ScreenShareToggle />
        <RaiseHandToggle />
        <IconButton tone="danger" label={t('room.leave')} onClick={() => void leave()}>
          <PhoneOff size={20} />
        </IconButton>
      </div>
      <div className="control-bar__panels">
        <IconButton
          tone={isDevMode ? 'accent' : 'neutral'}
          label={t('dev.title')}
          aria-expanded={sidePanel === 'dev'}
          onClick={() => onToggleSidePanel('dev')}
        >
          <CodeXml size={20} />
        </IconButton>
        <IconButton
          tone={sidePanel === 'participants' ? 'accent' : 'neutral'}
          label={t('room.participants')}
          aria-expanded={sidePanel === 'participants'}
          onClick={() => onToggleSidePanel('participants')}
        >
          <Users size={20} />
          <span className="icon-button__badge">{peerCount}</span>
        </IconButton>
      </div>
    </footer>
  );
}
