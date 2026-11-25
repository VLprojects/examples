import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router';
import { useSessionStore } from '@/entities/session';
import { ControlBar } from '@/widgets/control-bar';
import { Header } from '@/widgets/header';
import { Lobby } from '@/widgets/lobby';
import { VideoGrid } from '@/widgets/video-grid';

export function RoomPage() {
  const { t } = useTranslation();
  const { alias = '' } = useParams();
  const status = useSessionStore((state) => state.status);

  if (status === 'idle' || status === 'error') {
    return (
      <div className="page">
        <Header />
        <main className="page__center">
          <Lobby key={status} alias={alias} />
        </main>
      </div>
    );
  }

  if (status === 'kicked') {
    return (
      <div className="page">
        <Header />
        <main className="page__center">
          <section className="card hero">
            <p>{t('room.status.kicked')}</p>
            <Link to="/">{t('room.backHome')}</Link>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="page page--room">
      <Header />
      {status !== 'connected' && <div className="status-banner">{t(`room.status.${status}`)}</div>}
      <main className="page__stage">
        <VideoGrid />
      </main>
      {status === 'connected' && <ControlBar />}
    </div>
  );
}
