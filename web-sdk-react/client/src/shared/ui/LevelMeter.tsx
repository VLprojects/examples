import { useEffect, useRef } from 'react';

interface LevelMeterProps {
  track: MediaStreamTrack;
}

export function LevelMeter({ track }: LevelMeterProps) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const context = new AudioContext();
    const analyser = context.createAnalyser();
    const source = context.createMediaStreamSource(new MediaStream([track]));
    const samples = new Uint8Array(analyser.frequencyBinCount);
    let frame = 0;

    source.connect(analyser);

    const draw = () => {
      analyser.getByteFrequencyData(samples);

      const level = samples.reduce((sum, value) => sum + value, 0) / samples.length / 255;

      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${Math.min(1, level * 3)})`;
      }

      frame = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(frame);
      source.disconnect();
      void context.close();
    };
  }, [track]);

  return (
    <div className="level-meter">
      <div ref={barRef} className="level-meter__bar" />
    </div>
  );
}
