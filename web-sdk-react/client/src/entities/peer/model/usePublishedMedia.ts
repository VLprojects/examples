import type { PayloadOfPublishedMedia, Peer } from '@livedigital/client';
import { useEffect, useState } from 'react';

const PUBLICATION_EVENTS = ['media-published', 'media-unpublished', 'publisher-paused', 'publisher-resumed'] as const;

export function usePublishedMedia(peer: Peer): PayloadOfPublishedMedia[] {
  const [media, setMedia] = useState(() => peer.publishedMedia);

  useEffect(() => {
    const update = () => setMedia(peer.publishedMedia);

    PUBLICATION_EVENTS.forEach((event) => peer.observer.on(event, update));

    return () => {
      PUBLICATION_EVENTS.forEach((event) => peer.observer.off(event, update));
    };
  }, [peer]);

  return media;
}
