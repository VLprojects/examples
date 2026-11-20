import type { Peer, PeerTrack } from '@livedigital/client';
import { useEffect, useState } from 'react';

type TracksByLabel = Map<string, PeerTrack>;

const TRACK_EVENTS = ['track-start', 'track-end', 'track-paused', 'track-resumed'] as const;

const collectTracks = (peer: Peer): TracksByLabel => (
  new Map([...peer.tracks.values()].map((track) => [track.label, track]))
);

export function usePeerTracks(peer: Peer): TracksByLabel {
  const [tracks, setTracks] = useState(() => collectTracks(peer));

  useEffect(() => {
    const update = (track: PeerTrack, event: typeof TRACK_EVENTS[number]) => {
      setTracks((current) => {
        const next = new Map(current);

        if (event === 'track-end') {
          next.delete(track.label);
        } else {
          next.set(track.label, track);
        }

        return next;
      });
    };

    const handlers = TRACK_EVENTS.map((event) => {
      const handler = (track: PeerTrack) => update(track, event);

      peer.observer.on(event, handler);

      return { event, handler };
    });

    return () => {
      handlers.forEach(({ event, handler }) => peer.observer.off(event, handler));
    };
  }, [peer]);

  return tracks;
}
