import { NetworkQualityDirection } from '@livedigital/client';
import { useTranslation } from 'react-i18next';
import { Popover } from '@/shared/ui';
import {
  DIRECTIONS, isExplainedBySenders, selectHeadlineDirection,
} from '../model/quality';
import { useNetworkQualityStore } from '../model/store';
import { useSenderUplinkLevels } from '../model/useSenderUplinkLevels';
import { NetworkQualityIcon } from './NetworkQualityIcon';

export function NetworkQualityIndicator() {
  const { t } = useTranslation();
  const quality = useNetworkQualityStore((state) => state.quality);
  const senderUplinkLevels = useSenderUplinkLevels();
  const headlineDirection = selectHeadlineDirection(quality);
  const isCausedBySenders = isExplainedBySenders(quality, senderUplinkLevels);

  return (
    <Popover
      label={t('networkQuality.title')}
      icon={<NetworkQualityIcon level={quality[headlineDirection].level} direction={headlineDirection} />}
    >
      <h3 className="settings-title">{t('networkQuality.title')}</h3>
      <dl className="network-quality">
        {DIRECTIONS.map((direction) => {
          const { level, reasons, score } = quality[direction];

          return (
            <div key={direction} className="network-quality__row">
              <dt>{t(`networkQuality.directions.${direction}`)}</dt>
              <dd className={`network-level network-level--${level}`}>
                {t(`networkQuality.levels.${level}`)}
                {score !== undefined && <span className="network-quality__score">{Math.round(score)}</span>}
              </dd>
              {reasons.length > 0 && (
                <dd className="network-quality__reasons">
                  {reasons.map((reason) => t(`networkQuality.reasons.${reason}`)).join(', ')}
                </dd>
              )}
              {direction === NetworkQualityDirection.Downlink && isCausedBySenders && (
                <dd className="network-quality__reasons">{t('networkQuality.causedBySenders')}</dd>
              )}
            </div>
          );
        })}
      </dl>
      <p className="hint">{t('networkQuality.hint')}</p>
    </Popover>
  );
}
