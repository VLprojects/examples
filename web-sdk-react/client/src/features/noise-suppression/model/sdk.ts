import type { ClientParams } from '@livedigital/client';

const ASDK_VERSION = '2.5.1';
const ASDK_DIR = '/asdk';

export const createNoiseSuppressionParams = (staticFilesPath: string): Pick<ClientParams, 'denoiser' | 'asdk'> => ({
  denoiser: 'asdk',
  asdk: {
    // @ts-expect-error the SDK typings list only 2.3.5, which is no longer hosted
    version: ASDK_VERSION,
    localDir: ASDK_DIR,
    sdk_url: `${staticFilesPath}${ASDK_DIR}/${ASDK_VERSION}/`,
  },
});
