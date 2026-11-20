import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { bindSessionEvents } from '@/entities/session';
import { demoApi } from '@/shared/api';
import { initI18n } from '@/shared/i18n';
import { createSdkClient } from '@/shared/sdk';
import { App } from './App';
import './styles/index.css';

const [sdkConfig] = await Promise.all([demoApi.getSdkConfig(), initI18n()]);

bindSessionEvents(createSdkClient({ ...sdkConfig, logLevel: 4 }));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
