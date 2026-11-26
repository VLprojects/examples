import { docsUrl } from '@/shared/config';

const ANCHORS: Record<string, string> = {
  'track-paused': 'track-paused--track-resumed',
  'track-resumed': 'track-paused--track-resumed',
};

const NETWORK_EVENTS = ['network-quality-updated', 'network-scores-updated'];

export interface EventGuide {
  descriptionKey: string;
  code?: string;
  docsUrl?: string;
}

export const describeEvent = (source: string, name: string): EventGuide => {
  if (source === 'app') {
    return { descriptionKey: 'session' };
  }

  const isClientEvent = source === 'client';
  const emitter = isClientEvent ? 'client' : 'peer';
  const code = `${emitter}.observer.on('${name}', (payload) => { /* … */ });`;

  if (NETWORK_EVENTS.includes(name)) {
    return { descriptionKey: name, code, docsUrl: docsUrl('network-quality') };
  }

  if (!isClientEvent && name === 'track-failed') {
    return { descriptionKey: 'peer-track-failed', code, docsUrl: docsUrl('events-reference', 'track-failed-peer') };
  }

  return { descriptionKey: name, code, docsUrl: docsUrl('events-reference', ANCHORS[name] ?? name) };
};
