import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSessionStore } from '@/entities/session';
import { MediaToggle, useLocalMediaStore } from '@/features/local-media';
import { getSdkClient } from '@/shared/sdk';
import { Button } from '@/shared/ui';

export function ControlBar() {
  const { t } = useTranslation();
  const disconnect = useSessionStore((state) => state.disconnect);
  const resetLocalMedia = useLocalMediaStore((state) => state.reset);
  const hasMediaFailed = useLocalMediaStore((state) => state.failed);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const canPublish = getSdkClient().peers.some((peer) => peer.isMe && peer.role === 'host');

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setIsLinkCopied(true);
    setTimeout(() => setIsLinkCopied(false), 2000);
  };

  const leave = async () => {
    await disconnect();
    resetLocalMedia();
  };

  return (
    <footer className="control-bar">
      {hasMediaFailed && <p className="error control-bar__error">{t('media.error')}</p>}
      <div className="control-bar__buttons">
        {canPublish && (
          <>
            <MediaToggle kind="microphone" />
            <MediaToggle kind="camera" />
          </>
        )}
        <Button onClick={() => void copyLink()}>{t(isLinkCopied ? 'room.linkCopied' : 'room.copyLink')}</Button>
        <Button variant="danger" onClick={() => void leave()}>{t('room.leave')}</Button>
      </div>
    </footer>
  );
}
