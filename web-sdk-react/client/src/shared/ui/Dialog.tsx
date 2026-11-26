import { X } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import { IconButton } from './IconButton';

interface DialogProps {
  title: string;
  closeLabel: string;
  isOpen: boolean;
  actions?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  onClose: () => void;
}

export function Dialog({ title, closeLabel, isOpen, actions, footer, children, onClose }: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;

    if (isOpen && !dialog?.open) {
      dialog?.showModal();
    }

    if (!isOpen && dialog?.open) {
      dialog.close();
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      className="dialog"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={({ target, currentTarget }) => {
        if (target === currentTarget) {
          onClose();
        }
      }}
    >
      {isOpen && (
        <div className="dialog__content">
          <header className="dialog__header">
            <h2 id={titleId}>{title}</h2>
            {actions}
            <IconButton size="small" label={closeLabel} onClick={onClose}>
              <X size={16} />
            </IconButton>
          </header>
          {children}
          {footer && <footer className="dialog__footer">{footer}</footer>}
        </div>
      )}
    </dialog>
  );
}
