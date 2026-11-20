import { randomUUID } from 'node:crypto';

export type ParticipantRole = 'host' | 'audience';

export interface Room {
  id: string;
  alias: string;
  spaceId: string;
  channelId: string;
}

interface Participant {
  id: string;
}

interface LivedigitalApiParams {
  apiUrl: string;
  personalToken: string;
  spaceId: string;
}

export class LivedigitalApiError extends Error {
  readonly status: number;

  constructor(status: number, path: string) {
    super(`livedigital API responded ${status} for ${path}`);
    this.status = status;
  }
}

export const createLivedigitalApi = ({ apiUrl, personalToken, spaceId }: LivedigitalApiParams) => {
  const request = async <T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> => {
    const response = await fetch(`${apiUrl}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${personalToken}`,
        ...(method === 'POST' && { 'Content-Type': 'application/json' }),
      },
      ...(method === 'POST' && { body: JSON.stringify(body ?? {}) }),
    });

    if (!response.ok) {
      throw new LivedigitalApiError(response.status, path);
    }

    return response.json() as Promise<T>;
  };

  const createRoom = (name: string) => request<Room>('POST', `/spaces/${spaceId}/rooms`, {
    name,
    type: 'lesson',
    isPublic: false,
    isRecordAllowed: false,
    isChatAllowed: false,
  });

  const findRoomByAlias = async (alias: string): Promise<Room | undefined> => {
    try {
      const room = await request<Room>('GET', `/spaces/room-by-alias/${encodeURIComponent(alias)}`);

      return room.spaceId === spaceId ? room : undefined;
    } catch (error) {
      if (error instanceof LivedigitalApiError && [403, 404].includes(error.status)) {
        return undefined;
      }

      throw error;
    }
  };

  const createSignalingToken = async (room: Room, name: string, role: ParticipantRole) => {
    const participant = await request<Participant>('POST', `/spaces/${spaceId}/participants`, {
      name,
      role,
      roomId: room.id,
      clientUniqueId: `client-${randomUUID()}`,
    });

    const { signalingToken } = await request<{ signalingToken: string }>(
      'POST',
      `/spaces/${spaceId}/participants/${participant.id}/signaling-token`,
    );

    return { token: signalingToken, participantId: participant.id };
  };

  return { createRoom, findRoomByAlias, createSignalingToken };
};

export type LivedigitalApi = ReturnType<typeof createLivedigitalApi>;
