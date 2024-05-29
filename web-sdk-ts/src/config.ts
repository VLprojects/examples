import type { Role } from '@livedigital/client/dist/types/common';
import jwt from 'jsonwebtoken';

const jwtSecret = 'secret_of_your_client';
const appId = 'your_app_id'
const channelId = 'your_channel_id';
const uid = crypto.randomUUID().replace(/-/g, '').slice(0, 24); // unique objectId, for example
const role = 'host' as Role;

const token = jwt.sign({ channelId }, jwtSecret, { issuer: appId, subject: uid, audience: role });


export const joinParams = {
  channelId,
  token,
  role,
};
