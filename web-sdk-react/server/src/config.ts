import { resolve } from 'node:path';

const required = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Environment variable ${name} is required`);
  }

  return value;
};

export const config = {
  port: Number(process.env.PORT ?? 3000),
  staticDir: process.env.STATIC_DIR ?? resolve(import.meta.dirname, '../../client/dist'),
  livedigital: {
    apiUrl: process.env.LIVEDIGITAL_API_URL ?? 'https://moodhood-api.livedigital.space/v1',
    personalToken: required('LIVEDIGITAL_PERSONAL_TOKEN'),
    spaceId: required('LIVEDIGITAL_SPACE_ID'),
  },
  client: {
    signalingServerUrl: process.env.LIVEDIGITAL_SIGNALING_URL,
    analyticsApiUrl: process.env.LIVEDIGITAL_ANALYTICS_URL,
    staticFilesPath: process.env.LIVEDIGITAL_STATIC_URL ?? 'https://static.prod.livedigital.space',
  },
};
