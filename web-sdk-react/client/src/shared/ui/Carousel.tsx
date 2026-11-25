import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

interface CarouselProps {
  label: string;
  children: ReactNode;
}

const EDGE_TOLERANCE = 2;

export function Carousel({ label, children }: CarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState({ before: false, after: false });

  useEffect(() => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    const measure = () => setHidden({
      before: track.scrollLeft > EDGE_TOLERANCE,
      after: track.scrollLeft + track.clientWidth < track.scrollWidth - EDGE_TOLERANCE,
    });
    const resizeObserver = new ResizeObserver(measure);

    measure();
    resizeObserver.observe(track);
    track.addEventListener('scroll', measure, { passive: true });

    return () => {
      resizeObserver.disconnect();
      track.removeEventListener('scroll', measure);
    };
  }, []);

  const scroll = (direction: 1 | -1) => {
    const track = trackRef.current;

    track?.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: 'smooth' });
  };

  return (
    <div className="carousel">
      {hidden.before && (
        <button type="button" className="carousel__arrow carousel__arrow--before" tabIndex={-1} aria-hidden onClick={() => scroll(-1)}>
          <ChevronLeft size={16} />
        </button>
      )}
      <div ref={trackRef} className="carousel__track" role="radiogroup" aria-label={label}>
        {children}
      </div>
      {hidden.after && (
        <button type="button" className="carousel__arrow carousel__arrow--after" tabIndex={-1} aria-hidden onClick={() => scroll(1)}>
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
}
