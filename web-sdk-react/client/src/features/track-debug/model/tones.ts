import { thresholdTone, worstTone } from '@/shared/lib';
import type { Tone } from '@/shared/lib';
import type { PeerDebug } from './usePeerDebug';

const last = (values: number[]) => values.at(-1);

export const lossTone = (percent: number | undefined) => thresholdTone(percent, 1, 5);

export const jitterTone = (ms: number | undefined) => thresholdTone(ms, 30, 60);

export const limitationTone = (reason: string | undefined): Tone | undefined => {
  if (!reason) {
    return undefined;
  }

  return reason === 'none' ? 'good' : 'fair';
};

export const scoreTone = (score: number | undefined): Tone | undefined => {
  if (score === undefined) {
    return undefined;
  }

  if (score < 3) {
    return 'bad';
  }

  return score < 3.8 ? 'fair' : 'good';
};

export const selectOverallTone = ({ snapshot, history }: PeerDebug): Tone | undefined => worstTone([
  lossTone(last(history.videoLossPercent)),
  lossTone(last(history.audioLossPercent)),
  jitterTone(snapshot.video?.jitterMs),
  jitterTone(snapshot.audio?.jitterMs),
  limitationTone(snapshot.video?.qualityLimitationReason),
]);
