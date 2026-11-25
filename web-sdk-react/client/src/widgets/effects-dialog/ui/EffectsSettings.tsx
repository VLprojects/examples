import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BackgroundSettings, FrameSettings, PictureSettings, selectActiveTabs, useVideoEffectsStore,
} from '@/features/video-effects';
import type { EffectsTab } from '@/features/video-effects';
import { Tabs } from '@/shared/ui';

const TABS: EffectsTab[] = ['background', 'picture', 'frame'];

interface EffectsSettingsProps {
  displayName?: string;
}

export function EffectsSettings({ displayName }: EffectsSettingsProps) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<EffectsTab>('background');
  const settings = useVideoEffectsStore((state) => state.settings);
  const activeTabs = selectActiveTabs(settings);

  return (
    <div className="effects__settings">
      <Tabs
        label={t('effects.title')}
        value={tab}
        tabs={TABS.map((id) => ({ id, label: t(`effects.tabs.${id}`), isMarked: activeTabs[id] }))}
        onChange={setTab}
      />
      <div className="effects__panel" role="tabpanel" aria-label={t(`effects.tabs.${tab}`)}>
        {tab === 'background' && <BackgroundSettings />}
        {tab === 'picture' && <PictureSettings />}
        {tab === 'frame' && <FrameSettings displayName={displayName} />}
      </div>
    </div>
  );
}
