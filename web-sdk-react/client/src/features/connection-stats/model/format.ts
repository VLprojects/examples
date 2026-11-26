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
