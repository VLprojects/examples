import { docsUrl } from '@/shared/config';

export const DEV_TABS = ['events', 'logs', 'connection', 'report'] as const;

export type DevTab = typeof DEV_TABS[number];

export const TAB_GUIDES: Record<DevTab, { code: string; docsUrl: string }> = {
  events: {
    code: `client.observer.on('peer-joined', (peer) => {
  peer.observer.on('track-start', (track) => { /* … */ });
});`,
    docsUrl: docsUrl('events-reference'),
  },
  logs: {
    code: `const client = new Client({
  logLevel: 7,
  onLogMessage: (message, meta, level) => { /* … */ },
});`,
    docsUrl: docsUrl('client-initialization', 'логирование'),
  },
  connection: {
    code: `const { inbound, outbound } = client.transportsStats();

await client.changeIceTransportPolicy('relay');
await client.restartIce();`,
    docsUrl: docsUrl('network-quality', 'низкоуровневая-статистика'),
  },
  report: {
    code: `client.meta;
client.networkQuality();
client.transportsStats();
await track.getInfo();`,
    docsUrl: docsUrl('troubleshooting'),
  },
};
