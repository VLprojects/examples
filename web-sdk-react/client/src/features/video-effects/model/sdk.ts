import type { InitEffectsSDKParams } from '@livedigital/client';
import { demoApi } from '@/shared/api';
import { getSdkClient } from '@/shared/sdk';

const ESDK_VERSION = '3.8.0';
const ESDK_DIR = '/esdk';

const sdkUrl = (staticFilesPath: string) => `${staticFilesPath}${ESDK_DIR}/${ESDK_VERSION}/`;

export const createEffectsSdkParams = (staticFilesPath: string): InitEffectsSDKParams => ({
  version: ESDK_VERSION,
  localDir: ESDK_DIR,
  sdk_url: sdkUrl(staticFilesPath),
});

const loadScript = (src: string) => new Promise<void>((resolve, reject) => {
  const script = document.createElement('script');

  script.src = src;
  script.onload = () => resolve();
  script.onerror = () => reject(new Error(`Failed to load ${src}`));
  document.head.append(script);
});

let loading: Promise<void> | undefined;

export const loadEffectsSdk = (): Promise<void> => {
  loading ??= (async () => {
    const { staticFilesPath } = await demoApi.getSdkConfig();

    await loadScript(`${sdkUrl(staticFilesPath)}tsvb-web.js`);

    if (!await getSdkClient().initEffectsSDK()) {
      throw new Error('Effects SDK is not initialized');
    }
  })();

  loading.catch(() => {
    loading = undefined;
  });

  return loading;
};
