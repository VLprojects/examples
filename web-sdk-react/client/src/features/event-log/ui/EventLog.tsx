import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui';
import { FREQUENT_EVENTS, useEventLogStore } from '../model/store';

const formatTime = (time: number) => new Date(time).toLocaleTimeString([], { hour12: false });

export function EventLog() {
  const { t } = useTranslation();
  const entries = useEventLogStore((state) => state.entries);
  const clear = useEventLogStore((state) => state.clear);
  const [query, setQuery] = useState('');
  const [areFrequentShown, setAreFrequentShown] = useState(false);

  const visible = entries.filter(({ name, source }) => (
    (areFrequentShown || !FREQUENT_EVENTS.includes(name))
    && `${source} ${name}`.includes(query.trim().toLowerCase())
  ));

  return (
    <div className="event-log">
      <div className="event-log__toolbar">
        <input
          type="search"
          value={query}
          placeholder={t('dev.events.filter')}
          aria-label={t('dev.events.filter')}
          onChange={({ target }) => setQuery(target.value)}
        />
        <Button disabled={entries.length === 0} onClick={clear}>{t('dev.events.clear')}</Button>
      </div>
      <label className="switch">
        <input type="checkbox" checked={areFrequentShown} onChange={({ target }) => setAreFrequentShown(target.checked)} />
        <span>{t('dev.events.showFrequent')}</span>
      </label>
      {visible.length === 0 && <p className="hint">{t('dev.events.empty')}</p>}
      <ol className="event-log__list">
        {visible.map(({ id, time, source, name, payload }) => (
          <li key={id}>
            <details className="event-log__entry">
              <summary>
                <time>{formatTime(time)}</time>
                <span className="event-log__name">{name}</span>
                <span className="event-log__source">{source}</span>
              </summary>
              <pre>{payload || t('dev.events.noPayload')}</pre>
            </details>
          </li>
        ))}
      </ol>
    </div>
  );
}
