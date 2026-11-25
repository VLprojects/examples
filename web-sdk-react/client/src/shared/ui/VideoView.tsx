import { useEffect, useRef } from 'react';

interface VideoViewProps {
  track: MediaStreamTrack;
  mirrored?: boolean;
  contain?: boolean;
}

export function VideoView({ track, mirrored, contain }: VideoViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const className = ['video', mirrored && 'video--mirrored', contain && 'video--contain'].filter(Boolean).join(' ');

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

  return <video ref={videoRef} className={className} autoPlay playsInline muted />;
}
