import { version as sdkVersion } from '@livedigital/client/package.json';
import type { IceTransportPolicy, TransportsWebRTCStats } from '@livedigital/client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { docsUrl } from '@/shared/config';
import { getSdkClient } from '@/shared/sdk';
import {
  Button, Segmented, StatRow, showToast,
} from '@/shared/ui';
import {
  formatKbps, formatMs, formatScore, iceStateTone, rttTone,
} from '@/shared/lib';
import { useIcePolicyStore } from '../model/store';
import { useConnectionStats } from '../model/useConnectionStats';

const DIRECTIONS = ['outbound', 'inbound'] as const;
const POLICIES: IceTransportPolicy[] = ['all', 'relay'];

const STATS_DOCS_URL = docsUrl('network-quality', 'низкоуровневая-статистика');
const TRANSPORT_FIELDS = {
  iceState: 'state',
  candidate: 'local.candidateType · remote.candidateType',
  rtt: 'currentRoundTripTime',
  bitrate: 'bitrate',
  availableBitrate: 'availableOutgoingBitrate',
  streamScores: 'Qa · Qv · Qav',
};
const META_FIELDS = ['channelId', 'peerId', 'clUId'] as const;

const clean = (value: string | undefined) => (value && value !== 'undefined' ? value : undefined);

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
        const hint = (field: keyof typeof TRANSPORT_FIELDS) => ({
          text: t(`dev.connection.hints.${field}`),
          code: `client.transportsStats().${direction}.${TRANSPORT_FIELDS[field]}`,
          docsUrl: STATS_DOCS_URL,
        });

        return (
          <section key={direction}>
            <h3 className="settings-title">{t(`dev.connection.${direction}`)}</h3>
            {stats ? (
              <dl className="stats__list">
                <StatRow label={t('dev.connection.iceState')} value={stats.state} tone={iceStateTone(stats.state)} hint={hint('iceState')} />
                <StatRow label={t('dev.connection.localCandidate')} value={formatCandidate(stats.local)} hint={hint('candidate')} />
                <StatRow label={t('dev.connection.remoteCandidate')} value={formatCandidate(stats.remote)} />
                <StatRow
                  label="RTT"
                  value={formatMs(stats.currentRoundTripTime)}
                  tone={rttTone(stats.currentRoundTripTime)}
                  hint={hint('rtt')}
                />
                <StatRow label={t('dev.connection.bitrate')} value={formatKbps(stats.bitrate)} hint={hint('bitrate')} />
                {direction === 'outbound' && (
                  <StatRow
                    label={t('dev.connection.availableBitrate')}
                    value={formatKbps(stats.availableOutgoingBitrate)}
                    hint={hint('availableBitrate')}
                  />
                )}
                <StatRow
                  label={t('dev.connection.streamScores')}
                  value={`Qa ${formatScore(stats.Qa)} · Qv ${formatScore(stats.Qv)} · Qav ${formatScore(stats.Qav)}`}
                  hint={hint('streamScores')}
                />
              </dl>
            ) : <p className="hint">{t('dev.connection.noTransport')}</p>}
          </section>
        );
      })}
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
          <StatRow label={t('dev.connection.sdkVersion')} value={sdkVersion} />
          <StatRow label={t('dev.connection.datacenter')} value={clean(meta.datacenterName)} />
          <StatRow label={t('dev.connection.node')} value={clean(meta.nodeId)} />
          {META_FIELDS.map((field) => (
            <StatRow
              key={field}
              label={field}
              value={clean(meta[field])}
              hint={{ text: t(`dev.connection.hints.${field}`), code: `client.meta.${field}` }}
            />
          ))}
        </dl>
      </section>
    </div>
  );
}
