import { NetworkQualityDirection, NetworkQualityLevel, NetworkQualityReason } from '@livedigital/client';
import type { DirectionQuality, NetworkQuality } from '@livedigital/client';

export const DIRECTIONS = [
  NetworkQualityDirection.Uplink,
  NetworkQualityDirection.Downlink,
  NetworkQualityDirection.Device,
];

export const NETWORK_DIRECTIONS = [NetworkQualityDirection.Uplink, NetworkQualityDirection.Downlink];

export const SENDER_DIRECTIONS = [NetworkQualityDirection.Uplink, NetworkQualityDirection.Device];

const SEVERITY: Record<NetworkQualityLevel, number> = {
  [NetworkQualityLevel.Unknown]: 0,
  [NetworkQualityLevel.Good]: 1,
  [NetworkQualityLevel.Fair]: 2,
  [NetworkQualityLevel.Poor]: 3,
  [NetworkQualityLevel.Bad]: 4,
};

const LEVELS = Object.values(NetworkQualityLevel) as string[];
const REASONS = Object.values(NetworkQualityReason) as string[];

export const isProblem = (level: NetworkQualityLevel) => SEVERITY[level] >= SEVERITY[NetworkQualityLevel.Poor];

export const createUnknownQuality = (): NetworkQuality => ({
  [NetworkQualityDirection.Uplink]: { level: NetworkQualityLevel.Unknown, reasons: [] },
  [NetworkQualityDirection.Downlink]: { level: NetworkQualityLevel.Unknown, reasons: [] },
  [NetworkQualityDirection.Device]: { level: NetworkQualityLevel.Unknown, reasons: [] },
});

export const selectWorstDirection = (quality: NetworkQuality, directions = DIRECTIONS): NetworkQualityDirection => (
  directions.reduce((worst, direction) => (
    SEVERITY[quality[direction].level] > SEVERITY[quality[worst].level] ? direction : worst
  ))
);

const parseDirection = (raw: unknown): DirectionQuality | undefined => {
  if (typeof raw !== 'object' || raw === null) {
    return undefined;
  }

  const { level, reasons } = raw as Record<string, unknown>;

  if (typeof level !== 'string' || !LEVELS.includes(level)) {
    return undefined;
  }

  return {
    level: level as NetworkQualityLevel,
    reasons: Array.isArray(reasons) ? reasons.filter((reason) => REASONS.includes(reason)) : [],
  };
};

export const selectHeadlineDirection = (quality: NetworkQuality): NetworkQualityDirection => {
  const worst = selectWorstDirection(quality);

  return isProblem(quality[worst].level) ? worst : selectWorstDirection(quality, NETWORK_DIRECTIONS);
};

export const parseNetworkQuality = (raw: unknown): NetworkQuality => {
  const quality = createUnknownQuality();
  const source = typeof raw === 'object' && raw !== null ? raw as Record<string, unknown> : {};

  DIRECTIONS.forEach((direction) => {
    quality[direction] = parseDirection(source[direction]) ?? quality[direction];
  });

  return quality;
};

export const isExplainedBySenders = (own: NetworkQuality, senderUplinkLevels: NetworkQualityLevel[]) => (
  isProblem(own[NetworkQualityDirection.Downlink].level)
  && senderUplinkLevels.length > 0
  && senderUplinkLevels.every(isProblem)
);
