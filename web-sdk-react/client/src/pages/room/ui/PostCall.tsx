import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useSessionStore } from '@/entities/session';
import { Button } from '@/shared/ui';

interface PostCallProps {
  wasKicked: boolean;
}

export function PostCall({ wasKicked }: PostCallProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const reset = useSessionStore((state) => state.reset);

  const startNewCall = () => {
    reset();
    void navigate('/');
  };

  return (
    <section className="card post-call">
      <h1>{t(wasKicked ? 'room.status.kicked' : 'room.status.left')}</h1>
      <div className="post-call__actions">
        {!wasKicked && <Button variant="primary" onClick={reset}>{t('room.rejoin')}</Button>}
        <Button variant={wasKicked ? 'primary' : 'secondary'} onClick={startNewCall}>{t('room.newCall')}</Button>
      </div>
    </section>
  );
}
