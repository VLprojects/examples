import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConnectionStats } from '@/features/connection-stats';
import { EventLog } from '@/features/event-log';
import { Tabs } from '@/shared/ui';

const TABS = ['events', 'connection'] as const;

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
      <div className="dev-panel__body" role="tabpanel" aria-label={t(`dev.tabs.${tab}`)}>
        {tab === 'events' && <EventLog />}
        {tab === 'connection' && <ConnectionStats />}
      </div>
    </div>
  );
}
