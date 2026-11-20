import { existsSync } from 'node:fs';
import fastifyStatic from '@fastify/static';
import Fastify from 'fastify';
import { config } from './config.ts';
import { createLivedigitalApi } from './livedigital.ts';
import type { ParticipantRole } from './livedigital.ts';

const app = Fastify({ logger: true });
const livedigital = createLivedigitalApi(config.livedigital);

app.get('/healthz', () => ({ status: 'ok' }));

app.get('/api/config', () => config.client);

app.post<{ Body: { name?: string } }>('/api/rooms', {
  schema: {
    body: {
      type: 'object',
      properties: { name: { type: 'string', minLength: 1, maxLength: 64 } },
      additionalProperties: false,
    },
  },
}, async (request, reply) => {
  const room = await livedigital.createRoom(request.body?.name ?? 'SDK demo room');

  return reply.code(201).send({ alias: room.alias });
});

app.post<{ Params: { alias: string }; Body: { name: string; role: ParticipantRole } }>('/api/rooms/:alias/join', {
  schema: {
    params: {
      type: 'object',
      properties: { alias: { type: 'string', pattern: '^[A-Za-z0-9_-]{1,64}$' } },
      required: ['alias'],
    },
    body: {
      type: 'object',
      properties: {
        name: { type: 'string', minLength: 1, maxLength: 64 },
        role: { type: 'string', enum: ['host', 'audience'] },
      },
      required: ['name', 'role'],
      additionalProperties: false,
    },
  },
}, async (request, reply) => {
  const room = await livedigital.findRoomByAlias(request.params.alias);

  if (!room) {
    return reply.code(404).send({ message: 'Room not found' });
  }

  const { token, participantId } = await livedigital.createSignalingToken(room, request.body.name, request.body.role);

  return { token, participantId, channelId: room.channelId };
});

if (existsSync(config.staticDir)) {
  await app.register(fastifyStatic, { root: config.staticDir });

  app.setNotFoundHandler((request, reply) => {
    if (request.method !== 'GET' || request.url.startsWith('/api/')) {
      return reply.code(404).send({ message: 'Not found' });
    }

    return reply.sendFile('index.html');
  });
}

await app.listen({ port: config.port, host: '0.0.0.0' });
