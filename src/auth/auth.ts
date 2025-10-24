import { env } from '@/utils/env';
import { prisma } from '@/utils/prisma';
import axios from 'axios';
import Elysia from 'elysia';
import { jwtPlugin, jwtGuard } from '@/auth/jwt-guard';

export const login = new Elysia({ 'prefix': '/auth' })
  .use(jwtPlugin)  
  .get('/google', ({ redirect }) => {
    const redirectUri = env.BASE_URL_API + '/auth/google/callback';
    const clientId = env.GOOGLE_CLIENT_ID;
    const scope = 'openid profile email';

    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', scope);
    url.searchParams.set('access_type', 'offline');
    url.searchParams.set('prompt', 'consent');

    return redirect(url.toString());
  })
  .get('/google/callback', async ({ query, redirect, jwt }) => {
    const { data } = await axios.post('https://oauth2.googleapis.com/token', {
      code: query.code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: env.BASE_URL_API + '/auth/google/callback',
      grant_type: 'authorization_code'
    });


    const { data: userInfo } = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${data.access_token}`
      }
    });

    const user = await prisma.user.upsert({
      where: { email: userInfo.email },
      update: {
        name: userInfo.name,
      },
      create: {
        name: userInfo.name,
        email: userInfo.email,
      },
    });

    const token = await jwt.sign({
      id: user.id,
      email: user.email,
    });

    return redirect(env.BASE_URL_WEB + `/${query.path}?token=${token}`);
  })
  .derive(async ({ headers, jwt, set }) => {
    const token = headers['authorization']?.replace('Bearer ', '');


    const user = await jwt.verify(token);
    if (!user) {
      set.status = 401;
      const message = JSON.stringify({ message: 'Token invalido' });
      throw new Error(message);
    }

    return { user };
  })
  .use(jwtGuard)
  .get('/me', ({ user }) => {
    return user;
  })
  .get('/rota-privada', () => ({ message: 'privada' }));


