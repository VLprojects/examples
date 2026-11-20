import { Client } from '@livedigital/client';
import type { ClientParams } from '@livedigital/client';

let client: Client | undefined;

export const createSdkClient = (params: ClientParams): Client => {
  client ??= new Client(params);

  return client;
};

export const getSdkClient = (): Client => {
  if (!client) {
    throw new Error('SDK client is not created yet');
  }

  return client;
};
