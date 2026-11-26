import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { bindDeviceEvents } from '@/entities/device';
import { bindSessionEvents } from '@/entities/session';
import { bindEventLog } from '@/features/event-log';
import { bindLocalMediaEvents } from '@/features/local-media';
import { bindNetworkQualityEvents } from '@/features/network-quality';
import { bindNoiseSuppressionEvents, createNoiseSuppressionParams } from '@/features/noise-suppression';
import { bindRoomNotifications } from '@/features/room-notifications';
import { bindVideoEffectsEvents, createEffectsSdkParams } from '@/features/video-effects';
import { demoApi } from '@/shared/api';
import { initI18n } from '@/shared/i18n';
import { createSdkClient } from '@/shared/sdk';
import { App } from './App';
import './styles/index.css';

const [sdkConfig] = await Promise.all([demoApi.getSdkConfig(), initI18n()]);

const STATS_INTERVAL_MS = 1500;

const client = createSdkClient({
  ...sdkConfig,
  ...createNoiseSuppressionParams(sdkConfig.staticFilesPath),
  effectsSDKParams: createEffectsSdkParams(sdkConfig.staticFilesPath),
  getStatsInterval: STATS_INTERVAL_MS,
  logLevel: 4,
});

bindEventLog(client);
bindSessionEvents(client);
bindDeviceEvents(client);
bindLocalMediaEvents(client);
bindRoomNotifications(client);
bindVideoEffectsEvents(client);
bindNoiseSuppressionEvents(client);
bindNetworkQualityEvents(client);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
