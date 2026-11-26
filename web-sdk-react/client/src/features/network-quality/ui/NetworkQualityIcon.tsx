import { NetworkQualityDirection, NetworkQualityLevel } from '@livedigital/client';
import {
  Cpu, Signal, SignalHigh, SignalLow, SignalMedium,
} from 'lucide-react';

const ICONS = {
  [NetworkQualityLevel.Unknown]: Signal,
  [NetworkQualityLevel.Good]: Signal,
  [NetworkQualityLevel.Fair]: SignalHigh,
  [NetworkQualityLevel.Poor]: SignalMedium,
  [NetworkQualityLevel.Bad]: SignalLow,
};

interface NetworkQualityIconProps {
  level: NetworkQualityLevel;
  direction?: NetworkQualityDirection;
  size?: number;
}

export function NetworkQualityIcon({ level, direction, size = 20 }: NetworkQualityIconProps) {
  const Icon = direction === NetworkQualityDirection.Device ? Cpu : ICONS[level];

  return <Icon size={size} className={`network-level network-level--${level}`} />;
}
