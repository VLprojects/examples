import { Info } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { Tone } from '@/shared/lib';
import { ApiNote } from './ApiNote';
import type { ApiNoteProps } from './ApiNote';

interface StatRowProps {
  label: string;
  value: ReactNode;
  tone?: Tone;
  chart?: ReactNode;
  hint?: ApiNoteProps;
}

export function StatRow({
  label, value, tone, chart, hint,
}: StatRowProps) {
  const { t } = useTranslation();
  const [isHintOpen, setIsHintOpen] = useState(false);

  return (
    <div className="stats__row">
      <dt>
        {label}
        {hint && (
          <button
            type="button"
            className="stats__info"
            aria-label={t('apiNote.about', { label })}
            aria-expanded={isHintOpen}
            onClick={() => setIsHintOpen(!isHintOpen)}
          >
            <Info size={13} aria-hidden />
          </button>
        )}
      </dt>
      <dd className={tone && `stats__value--${tone}`}>
        {chart}
        {value ?? '—'}
      </dd>
      {hint && isHintOpen && <dd className="stats__hint"><ApiNote {...hint} /></dd>}
    </div>
  );
}
