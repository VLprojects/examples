import { version as sdkVersion } from '@livedigital/client/package.json';
import type { IceTransportPolicy, TransportsWebRTCStats } from '@livedigital/client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getSdkClient } from '@/shared/sdk';
import { Button, Segmented, showToast } from '@/shared/ui';
import {
  formatKbps, formatMs, formatScore, iceStateTone, rttTone,
} from '../model/format';
import type { Tone } from '../model/format';
import { useIcePolicyStore } from '../model/store';
import { useConnectionStats } from '../model/useConnectionStats';

const DIRECTIONS = ['outbound', 'inbound'] as const;
const POLICIES: IceTransportPolicy[] = ['all', 'relay'];

interface RowProps {
  label: string;
  value: string | undefined;
  tone?: Tone;
}

function Row({ label, value, tone }: RowProps) {
  return (
    <div className="stats__row">
      <dt>{label}</dt>
      <dd className={tone && `stats__value--${tone}`}>{value && value !== 'undefined' ? value : '—'}</dd>
    </div>
  );
}

const formatCandidate = (candidate: NonNullable<TransportsWebRTCStats['inbound']>['local'] | undefined) => (
  candidate && `${candidate.candidateType} · ${candidate.protocol} · ${candidate.address ?? candidate.ip}:${candidate.port}`
);

export function ConnectionStats() {
  const { t } = useTranslation();
  const { transports, meta, isRelayEnforced } = useConnectionStats();
  const policy = useIcePolicyStore((state) => state.policy);
  const changePolicy = useIcePolicyStore((state) => state.change);
  const [isBusy, setIsBusy] = useState(false);

  const run = async (operation: () => Promise<void>) => {
    setIsBusy(true);

    try {
      await operation();
    } catch {
      showToast('dev.connection.failed', { tone: 'error' });
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="stats">
      {DIRECTIONS.map((direction) => {
        const stats = transports[direction];

        return (
          <section key={direction}>
            <h3 className="settings-title">{t(`dev.connection.${direction}`)}</h3>
            {stats ? (
              <dl className="stats__list">
                <Row label={t('dev.connection.iceState')} value={stats.state} tone={iceStateTone(stats.state)} />
                <Row label={t('dev.connection.localCandidate')} value={formatCandidate(stats.local)} />
                <Row label={t('dev.connection.remoteCandidate')} value={formatCandidate(stats.remote)} />
                <Row label="RTT" value={formatMs(stats.currentRoundTripTime)} tone={rttTone(stats.currentRoundTripTime)} />
                <Row label={t('dev.connection.bitrate')} value={formatKbps(stats.bitrate)} />
                {direction === 'outbound' && (
                  <Row label={t('dev.connection.availableBitrate')} value={formatKbps(stats.availableOutgoingBitrate)} />
                )}
                <Row
                  label={t('dev.connection.streamScores')}
                  value={`Qa ${formatScore(stats.Qa)} · Qv ${formatScore(stats.Qv)} · Qav ${formatScore(stats.Qav)}`}
                />
              </dl>
            ) : <p className="hint">{t('dev.connection.noTransport')}</p>}
          </section>
        );
      })}
      <p className="hint">{t('dev.connection.scoresHint')}</p>
      <section>
        <h3 className="settings-title">{t('dev.connection.ice')}</h3>
        <Segmented
          label={t('dev.connection.icePolicy')}
          value={isRelayEnforced ? 'relay' : policy}
          options={POLICIES.map((value) => ({ value, label: t(`dev.connection.policies.${value}`) }))}
          onChange={(value) => void run(() => changePolicy(value))}
        />
        {isRelayEnforced && <p className="hint">{t('dev.connection.relayEnforced')}</p>}
        <Button disabled={isBusy} onClick={() => void run(() => getSdkClient().restartIce())}>
          {t('dev.connection.restartIce')}
        </Button>
      </section>
      <section>
        <h3 className="settings-title">{t('dev.connection.session')}</h3>
        <dl className="stats__list">
          <Row label={t('dev.connection.sdkVersion')} value={sdkVersion} />
          <Row label={t('dev.connection.datacenter')} value={meta.datacenterName} />
          <Row label={t('dev.connection.node')} value={meta.nodeId} />
          <Row label="channelId" value={meta.channelId} />
          <Row label="peerId" value={meta.peerId} />
          <Row label="clUId" value={meta.clUId} />
        </dl>
      </section>
    </div>
  );
}
