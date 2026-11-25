import { JoinRoomForm } from '@/features/join-room';
import { useLocalMediaStore } from '@/features/local-media';
import { MediaPreview, usePreviewStore } from '@/features/preview-media';

interface LobbyProps {
  alias: string;
}

export function Lobby({ alias }: LobbyProps) {
  const stopPreview = usePreviewStore((state) => state.stop);
  const startLocalMedia = useLocalMediaStore((state) => state.start);

  return (
    <div className="lobby">
      <MediaPreview />
      <JoinRoomForm
        alias={alias}
        beforeJoin={stopPreview}
        afterJoin={async (role) => {
          if (role === 'host') {
            await startLocalMedia(usePreviewStore.getState().enabled);
          }
        }}
      />
    </div>
  );
}
