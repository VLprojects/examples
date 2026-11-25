import type { ClientParams } from '@livedigital/client';

export type SdkConfig = Pick<ClientParams, 'signalingServerUrl' | 'analyticsApiUrl' | 'staticFilesPath'>;

export interface JoinCredentials {
  token: string;
  participantId: string;
  channelId: string;
}

export class DemoApiError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`Demo API responded ${status}`);
    this.status = status;
  }
}

const request = async <T>(path: string, body?: unknown): Promise<T> => {
  const response = await fetch(`/api${path}`, body === undefined ? undefined : {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new DemoApiError(response.status);
  }

  return response.json() as Promise<T>;
};

export const demoApi = {
  getSdkConfig: () => request<SdkConfig>('/config'),
  createRoom: () => request<{ alias: string }>('/rooms', {}),
  joinRoom: (alias: string, name: string) => (
    request<JoinCredentials>(`/rooms/${encodeURIComponent(alias)}/join`, { name, role: 'host' })
  ),
};
