import type { ButtonHTMLAttributes } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  tone?: 'neutral' | 'accent' | 'danger';
  size?: 'medium' | 'small';
}

export function IconButton({ label, tone = 'neutral', size = 'medium', className, ...props }: IconButtonProps) {
  const classNames = ['icon-button', `icon-button--${tone}`, `icon-button--${size}`, className].filter(Boolean).join(' ');

  return <button type="button" className={classNames} aria-label={label} title={label} {...props} />;
}
