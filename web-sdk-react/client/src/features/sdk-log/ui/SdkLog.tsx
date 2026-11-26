import { useVirtualizer } from '@tanstack/react-virtual';
import { ArrowDownToLine } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, JsonTree, showToast } from '@/shared/ui';
import {
  LOG_LEVELS, selectLevelCounts, toReportEntry, useSdkLogStore,
} from '../model/store';
import type { SdkLogEntry, SdkLogLevel } from '../model/store';

const ROW_HEIGHT = 29;
const PIN_THRESHOLD = 24;

const TIME_FORMAT = new Intl.DateTimeFormat([], {
  hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3,
});

const formatTime = (time: number) => TIME_FORMAT.format(time);

const copyEntry = async (entry: SdkLogEntry) => {
  await navigator.clipboard.writeText(JSON.stringify(toReportEntry(entry), null, 2));
  showToast('dev.copied');
};

export function SdkLog() {
  const { t } = useTranslation();
  const entries = useSdkLogStore((state) => state.entries);
  const clear = useSdkLogStore((state) => state.clear);
  const [query, setQuery] = useState('');
  const [hiddenLevels, setHiddenLevels] = useState<SdkLogLevel[]>([]);
  const [expandedIds, setExpandedIds] = useState<number[]>([]);
  const [isPinned, setIsPinned] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const counts = selectLevelCounts(entries);
  const search = query.trim().toLowerCase();
  const visible = entries.filter(({ level, searchText }) => (
    !hiddenLevels.includes(level) && searchText.includes(search)
  ));
  const lastId = visible.at(-1)?.id;

  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: visible.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    getItemKey: (index) => visible[index].id,
    overscan: 12,
  });

  useEffect(() => {
    if (isPinned && lastId !== undefined) {
      virtualizer.scrollToIndex(visible.length - 1, { align: 'end' });
    }
  }, [isPinned, lastId, visible.length, virtualizer]);

  const toggleLevel = (level: SdkLogLevel) => setHiddenLevels((levels) => (
    levels.includes(level) ? levels.filter((item) => item !== level) : [...levels, level]
  ));

  const toggleEntry = (id: number) => setExpandedIds((ids) => (
    ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]
  ));

  const trackPin = () => {
    const element = scrollRef.current;

    if (element) {
      setIsPinned(element.scrollHeight - element.scrollTop - element.clientHeight < PIN_THRESHOLD);
    }
  };

  return (
    <div className="sdk-log">
      <div className="event-log__toolbar">
        <input
          type="search"
          value={query}
          placeholder={t('dev.logs.filter')}
          aria-label={t('dev.logs.filter')}
          onChange={({ target }) => setQuery(target.value)}
        />
        <Button disabled={entries.length === 0} onClick={clear}>{t('dev.logs.clear')}</Button>
      </div>
      <div className="sdk-log__levels" role="group" aria-label={t('dev.logs.levels')}>
        {LOG_LEVELS.map((level) => (
          <button
            key={level}
            type="button"
            className={`sdk-log__chip sdk-log__chip--${level}`}
            aria-pressed={!hiddenLevels.includes(level)}
            onClick={() => toggleLevel(level)}
          >
            {level}
            <span>{counts[level]}</span>
          </button>
        ))}
      </div>
      {visible.length === 0 && (
        <p className="hint">{t(entries.length === 0 ? 'dev.logs.empty' : 'dev.logs.nothingFound')}</p>
      )}
      <div ref={scrollRef} className="sdk-log__scroll" onScroll={trackPin}>
        <div className="sdk-log__list" role="log" style={{ height: virtualizer.getTotalSize() }}>
          {virtualizer.getVirtualItems().map(({ index, key, start }) => {
            const entry = visible[index];
            const isExpanded = expandedIds.includes(entry.id);

            return (
              <div
                key={key}
                ref={virtualizer.measureElement}
                data-index={index}
                className={`sdk-log__row sdk-log__row--${entry.level}`}
                style={{ transform: `translateY(${start}px)` }}
              >
                <button
                  type="button"
                  className="sdk-log__summary"
                  aria-expanded={isExpanded}
                  onClick={() => toggleEntry(entry.id)}
                >
                  <time>{formatTime(entry.time)}</time>
                  <span className="sdk-log__level">{entry.level}</span>
                  <span className="sdk-log__message">{entry.message}</span>
                </button>
                {isExpanded && (
                  <div className="sdk-log__details">
                    <JsonTree data={entry.meta} />
                    <Button onClick={() => void copyEntry(entry)}>{t('dev.logs.copy')}</Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {!isPinned && (
        <button type="button" className="sdk-log__latest" onClick={() => setIsPinned(true)}>
          <ArrowDownToLine size={14} aria-hidden />
          {t('dev.logs.toLatest')}
        </button>
      )}
    </div>
  );
}
