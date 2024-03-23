import jwt from 'jsonwebtoken';

const jwtSecret = 'secret_of_your_client';
const appId = 'your_app_id'
const channelId = 'your_channel_id';
const uid = '65fd7046789d2de7d98f2cd6'; // unique objectId, for example
const role = 'host';

const token = jwt.sign({ channelId }, jwtSecret, { issuer: appId, subject: uid, audience: role });


export const joinParams = {
  channelId,
  token,
  role,
};
