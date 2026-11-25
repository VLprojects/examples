import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { demoApi } from '@/shared/api';
import { Button } from '@/shared/ui';

interface CreateRoomButtonProps {
  onCreated: (alias: string) => void;
}

export function CreateRoomButton({ onCreated }: CreateRoomButtonProps) {
  const { t } = useTranslation();
  const [isCreating, setIsCreating] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  const createRoom = async () => {
    setIsCreating(true);
    setHasFailed(false);

    try {
      const { alias } = await demoApi.createRoom();

      onCreated(alias);
    } catch {
      setHasFailed(true);
      setIsCreating(false);
    }
  };

  return (
    <>
      <Button variant="primary" disabled={isCreating} onClick={() => void createRoom()}>
        {t(isCreating ? 'home.creating' : 'home.createRoom')}
      </Button>
      {hasFailed && <p className="error">{t('home.error')}</p>}
    </>
  );
}
