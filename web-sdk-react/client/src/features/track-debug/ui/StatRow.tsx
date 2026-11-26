import type { ReactNode } from 'react';
import type { Tone } from '@/shared/lib';

interface StatRowProps {
  label: string;
  value: ReactNode;
  tone?: Tone;
  chart?: ReactNode;
}

export function StatRow({ label, value, tone, chart }: StatRowProps) {
  return (
    <div className="stats__row">
      <dt>{label}</dt>
      <dd className={tone && `stats__value--${tone}`}>
        {chart}
        {value ?? '—'}
      </dd>
    </div>
  );
}
