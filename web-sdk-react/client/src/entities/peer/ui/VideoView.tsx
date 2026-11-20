import { useEffect, useRef } from 'react';

interface VideoViewProps {
  track: MediaStreamTrack;
  mirrored?: boolean;
}

export function VideoView({ track, mirrored }: VideoViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.srcObject = new MediaStream([track]);
    video.play().catch(() => undefined);

    return () => {
      video.srcObject = null;
    };
  }, [track]);

  return (
    <video
      ref={videoRef}
      className={mirrored ? 'video video--mirrored' : 'video'}
      autoPlay
      playsInline
      muted
    />
  );
}
