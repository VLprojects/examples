import type { ClientParams } from '@livedigital/client';
import { create } from 'zustand';

export const LOG_LEVELS = ['error', 'warn', 'info', 'debug'] as const;

export type SdkLogLevel = typeof LOG_LEVELS[number];

export interface SdkLogEntry {
  id: number;
  time: number;
  level: SdkLogLevel;
  message: string;
  meta: unknown;
  searchText: string;
}

const MAX_ENTRIES = 5000;
const FLUSH_MS = 250;

interface SdkLogState {
  entries: SdkLogEntry[];
  clear: () => void;
}

export const useSdkLogStore = create<SdkLogState>((set) => ({
  entries: [],
  clear: () => set({ entries: [] }),
}));

let nextId = 1;
let pending: SdkLogEntry[] = [];
let flushTimer: number | undefined;

const flush = () => {
  const batch = pending;

  pending = [];
  flushTimer = undefined;
  useSdkLogStore.setState(({ entries }) => ({ entries: [...entries, ...batch].slice(-MAX_ENTRIES) }));
};

const isLevel = (value: unknown): value is SdkLogLevel => LOG_LEVELS.includes(value as SdkLogLevel);

export const recordSdkLog: NonNullable<ClientParams['onLogMessage']> = (message: string, ...rest: unknown[]) => {
  const level = rest.at(-1);
  const details = rest.slice(0, -1);
  const meta = details.length > 1 ? details : details[0];

  pending.push({
    id: nextId,
    time: Date.now(),
    level: isLevel(level) ? level : 'info',
    message,
    meta,
    searchText: `${message} ${JSON.stringify(meta) ?? ''}`.toLowerCase(),
  });
  nextId += 1;
  flushTimer ??= window.setTimeout(flush, FLUSH_MS);
};

export const selectLevelCounts = (entries: SdkLogEntry[]): Record<SdkLogLevel, number> => {
  const counts = { error: 0, warn: 0, info: 0, debug: 0 };

  entries.forEach(({ level }) => {
    counts[level] += 1;
  });

  return counts;
};

export const toReportEntry = ({ time, level, message, meta }: SdkLogEntry) => ({
  time: new Date(time).toISOString(),
  level,
  message,
  meta,
});
