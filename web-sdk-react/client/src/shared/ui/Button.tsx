import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  active?: boolean;
}

export function Button({ variant = 'secondary', active, className, type = 'button', ...props }: ButtonProps) {
  const classNames = ['button', `button--${variant}`, active && 'button--active', className].filter(Boolean).join(' ');

  return <button type={type} className={classNames} {...props} />;
}
