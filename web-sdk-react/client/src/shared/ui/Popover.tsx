import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { IconButton } from './IconButton';

interface PopoverProps {
  label: string;
  icon: ReactNode;
  className?: string;
  tone?: 'neutral' | 'accent';
  children: ReactNode;
}

export function Popover({ label, icon, className, tone, children }: PopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const closeOnOutsidePress = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        containerRef.current?.querySelector('button')?.focus();
      }
    };

    document.addEventListener('pointerdown', closeOnOutsidePress);
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePress);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="popover">
      <IconButton
        className={className}
        tone={tone}
        label={label}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        {icon}
      </IconButton>
      {isOpen && <div className="popover__panel" role="dialog" aria-label={label}>{children}</div>}
    </div>
  );
}
