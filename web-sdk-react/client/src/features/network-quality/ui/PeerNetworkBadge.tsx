import type { Peer } from '@livedigital/client';
import { useTranslation } from 'react-i18next';
import { usePeerAppData } from '@/entities/peer';
import {
  DIRECTIONS, SENDER_DIRECTIONS, isProblem, parseNetworkQuality, selectWorstDirection,
} from '../model/quality';
import { useNetworkQualityStore } from '../model/store';
import { NetworkQualityIcon } from './NetworkQualityIcon';

interface PeerNetworkBadgeProps {
  peer: Peer;
}

export function PeerNetworkBadge({ peer }: PeerNetworkBadgeProps) {
  const { t } = useTranslation();
  const ownQuality = useNetworkQualityStore((state) => state.quality);
  const { networkQuality } = usePeerAppData(peer);
  const quality = peer.isMe ? ownQuality : parseNetworkQuality(networkQuality);
  const direction = selectWorstDirection(quality, peer.isMe ? DIRECTIONS : SENDER_DIRECTIONS);
  const { level, reasons } = quality[direction];

  if (!isProblem(level)) {
    return null;
  }

  const label = [
    `${t(`networkQuality.directions.${direction}`)}: ${t(`networkQuality.levels.${level}`)}`,
    ...reasons.map((reason) => t(`networkQuality.reasons.${reason}`)),
  ].join(', ');

  return (
    <span className="peer-tile__network" role="img" aria-label={label} title={label}>
      <NetworkQualityIcon level={level} direction={direction} size={14} />
    </span>
  );
}
