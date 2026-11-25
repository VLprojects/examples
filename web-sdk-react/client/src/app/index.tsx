import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { bindDeviceEvents } from '@/entities/device';
import { bindSessionEvents } from '@/entities/session';
import { bindLocalMediaEvents } from '@/features/local-media';
import { demoApi } from '@/shared/api';
import { initI18n } from '@/shared/i18n';
import { createSdkClient } from '@/shared/sdk';
import { App } from './App';
import './styles/index.css';

const [sdkConfig] = await Promise.all([demoApi.getSdkConfig(), initI18n()]);

const client = createSdkClient({ ...sdkConfig, logLevel: 4 });

bindSessionEvents(client);
bindDeviceEvents(client);
bindLocalMediaEvents(client);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
