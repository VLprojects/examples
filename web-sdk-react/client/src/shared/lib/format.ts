export type Tone = 'good' | 'fair' | 'bad';

export const formatKbps = (bitsPerSecond: number | undefined) => (
  bitsPerSecond === undefined ? '—' : `${Math.round(bitsPerSecond / 1000)} kbps`
);

export const formatMs = (seconds: number | undefined) => (
  seconds === undefined ? '—' : `${Math.round(seconds * 1000)} ms`
);

export const formatScore = (score: number | undefined) => (score === undefined ? '—' : score.toFixed(2));

export const rttTone = (seconds: number | undefined): Tone | undefined => {
  if (seconds === undefined) {
    return undefined;
  }

  if (seconds > 0.3) {
    return 'bad';
  }

  return seconds > 0.15 ? 'fair' : 'good';
};

export const iceStateTone = (state: string | undefined): Tone | undefined => {
  if (!state) {
    return undefined;
  }

  return state === 'succeeded' ? 'good' : 'fair';
};

const TONE_SEVERITY: Record<Tone, number> = { good: 0, fair: 1, bad: 2 };

export const worstTone = (tones: (Tone | undefined)[]): Tone | undefined => (
  tones.reduce<Tone | undefined>((worst, tone) => (
    tone && (!worst || TONE_SEVERITY[tone] > TONE_SEVERITY[worst]) ? tone : worst
  ), undefined)
);

export const thresholdTone = (value: number | undefined, fair: number, bad: number): Tone | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (value > bad) {
    return 'bad';
  }

  return value > fair ? 'fair' : 'good';
};

export const formatBitrate = (bitsPerSecond: number | undefined) => {
  if (bitsPerSecond === undefined) {
    return '—';
  }

  return bitsPerSecond >= 1_000_000
    ? `${(bitsPerSecond / 1_000_000).toFixed(1)} Mbps`
    : `${Math.round(bitsPerSecond / 1000)} kbps`;
};

export const formatPercent = (value: number | undefined) => (value === undefined ? '—' : `${value.toFixed(1)}%`);
