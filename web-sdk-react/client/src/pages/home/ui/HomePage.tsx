import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { CreateRoomButton } from '@/features/create-room';
import { Header } from '@/widgets/header';

export function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="page">
      <Header />
      <main className="page__center">
        <section className="card hero">
          <h1>{t('home.heading')}</h1>
          <p>{t('home.lead')}</p>
          <CreateRoomButton onCreated={(alias) => void navigate(`/r/${alias}`)} />
        </section>
      </main>
    </div>
  );
}
