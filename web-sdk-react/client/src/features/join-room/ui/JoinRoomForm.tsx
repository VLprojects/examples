import { useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useSessionStore } from '@/entities/session';
import { demoApi, DemoApiError } from '@/shared/api';
import { Button } from '@/shared/ui';

const NAME_STORAGE_KEY = 'sdk-demo:name';

interface JoinRoomFormProps {
  alias?: string;
  onRoomCreated: (alias: string) => void;
  beforeJoin?: () => Promise<void>;
  afterJoin?: () => Promise<void>;
}

export function JoinRoomForm({ alias, onRoomCreated, beforeJoin, afterJoin }: JoinRoomFormProps) {
  const { t } = useTranslation();
  const connect = useSessionStore((state) => state.connect);
  const [name, setName] = useState(() => localStorage.getItem(NAME_STORAGE_KEY) ?? '');
  const [isJoining, setIsJoining] = useState(false);
  const [errorKey, setErrorKey] = useState<'join.notFound' | 'join.error'>();

  const submit = async (event: FormEvent) => {
    event.preventDefault();

    const displayName = name.trim();

    localStorage.setItem(NAME_STORAGE_KEY, displayName);
    setIsJoining(true);
    setErrorKey(undefined);

    try {
      const roomAlias = alias ?? (await demoApi.createRoom()).alias;

      if (!alias) {
        onRoomCreated(roomAlias);
      }

      await beforeJoin?.();
      await connect({
        getToken: async () => (await demoApi.joinRoom(roomAlias, displayName)).token,
        appData: { displayName },
      });
      await afterJoin?.();
    } catch (error) {
      setErrorKey(error instanceof DemoApiError && error.status === 404 ? 'join.notFound' : 'join.error');
      setIsJoining(false);
    }
  };

  return (
    <form className="form" onSubmit={(event) => void submit(event)}>
      <label className="field">
        <span>{t('join.name')}</span>
        <input
          value={name}
          maxLength={64}
          placeholder={t('join.namePlaceholder')}
          onChange={(event) => setName(event.target.value)}
          autoFocus
          required
        />
      </label>
      <Button type="submit" variant="primary" disabled={isJoining || !name.trim()}>
        {t(isJoining ? 'join.joining' : alias ? 'join.submitJoin' : 'join.submitStart')}
      </Button>
      {errorKey && <p className="error">{t(errorKey)}</p>}
      {errorKey === 'join.notFound' && <Link to="/" onClick={() => setErrorKey(undefined)}>{t('room.newCall')}</Link>}
    </form>
  );
}
