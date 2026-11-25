import { useParams } from 'react-router';
import { useSessionStore } from '@/entities/session';
import { Header } from '@/widgets/header';
import { CallView } from './CallView';
import { Lobby } from './Lobby';
import { PostCall } from './PostCall';

export function RoomPage() {
  const { alias } = useParams();
  const status = useSessionStore((state) => state.status);

  if (status === 'connected' || status === 'reconnecting') {
    return <CallView />;
  }

  return (
    <div className="page">
      <Header />
      <main className="page__center">
        {status === 'left' || status === 'kicked'
          ? <PostCall wasKicked={status === 'kicked'} />
          : <Lobby alias={alias} />}
      </main>
    </div>
  );
}
