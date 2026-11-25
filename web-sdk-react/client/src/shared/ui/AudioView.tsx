import { useEffect, useRef } from 'react';

interface AudioViewProps {
  track: MediaStreamTrack;
  outputDeviceId?: string;
}

type AudioElementWithSink = HTMLAudioElement & { setSinkId?: (deviceId: string) => Promise<void> };

export function AudioView({ track, outputDeviceId }: AudioViewProps) {
  const audioRef = useRef<AudioElementWithSink>(null);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.srcObject = new MediaStream([track]);
    audio.play().catch(() => undefined);

    return () => {
      audio.srcObject = null;
    };
  }, [track]);

  useEffect(() => {
    if (outputDeviceId) {
      audioRef.current?.setSinkId?.(outputDeviceId).catch(() => undefined);
    }
  }, [outputDeviceId]);

  return <audio ref={audioRef} autoPlay />;
}
