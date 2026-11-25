import type { Role } from '@livedigital/client';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useSessionStore } from '@/entities/session';
import { demoApi, DemoApiError } from '@/shared/api';
import { Button } from '@/shared/ui';

const NAME_STORAGE_KEY = 'sdk-demo:name';

interface JoinRoomFormProps {
  alias: string;
  beforeJoin?: () => Promise<void>;
  afterJoin?: (role: Role) => Promise<void>;
}

export function JoinRoomForm({ alias, beforeJoin, afterJoin }: JoinRoomFormProps) {
  const { t } = useTranslation();
  const connect = useSessionStore((state) => state.connect);
  const [name, setName] = useState(() => localStorage.getItem(NAME_STORAGE_KEY) ?? '');
  const [role, setRole] = useState<Role>('host');
  const [isJoining, setIsJoining] = useState(false);
  const [errorKey, setErrorKey] = useState<'join.notFound' | 'join.error'>();

  const submit = async (event: FormEvent) => {
    event.preventDefault();

    const displayName = name.trim();

    localStorage.setItem(NAME_STORAGE_KEY, displayName);
    setIsJoining(true);
    setErrorKey(undefined);

    try {
      await beforeJoin?.();
      await connect({
        getToken: async () => (await demoApi.joinRoom(alias, { name: displayName, role })).token,
        appData: { displayName },
      });
      await afterJoin?.(role);
    } catch (error) {
      setErrorKey(error instanceof DemoApiError && error.status === 404 ? 'join.notFound' : 'join.error');
      setIsJoining(false);
    }
  };

  return (
    <form className="card form" onSubmit={(event) => void submit(event)}>
      <h1>{t('join.heading')}</h1>
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
      <label className="field">
        <span>{t('join.role')}</span>
        <select value={role} onChange={(event) => setRole(event.target.value as Role)}>
          <option value="host">{t('join.roleHost')}</option>
          <option value="audience">{t('join.roleAudience')}</option>
        </select>
      </label>
      <Button type="submit" variant="primary" disabled={isJoining || !name.trim()}>
        {t(isJoining ? 'join.joining' : 'join.submit')}
      </Button>
      {errorKey && <p className="error">{t(errorKey)}</p>}
    </form>
  );
}
