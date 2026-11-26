import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConnectionStats } from '@/features/connection-stats';
import { EventLog } from '@/features/event-log';
import { SdkLog } from '@/features/sdk-log';
import { Tabs } from '@/shared/ui';
import { ReportTab } from './ReportTab';

const TABS = ['events', 'logs', 'connection', 'report'] as const;

type DevTab = typeof TABS[number];

export function DevPanel() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<DevTab>('events');

  return (
    <div className="dev-panel">
      <Tabs
        label={t('dev.title')}
        value={tab}
        tabs={TABS.map((id) => ({ id, label: t(`dev.tabs.${id}`) }))}
        onChange={setTab}
      />
      <div className={`dev-panel__body dev-panel__body--${tab}`} role="tabpanel" aria-label={t(`dev.tabs.${tab}`)}>
        {tab === 'events' && <EventLog />}
        {tab === 'logs' && <SdkLog />}
        {tab === 'connection' && <ConnectionStats />}
        {tab === 'report' && <ReportTab />}
      </div>
    </div>
  );
}
