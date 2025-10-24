import { env } from '@/utils/env';
import { prisma } from '@/utils/prisma';
import axios from 'axios';
import Elysia from 'elysia';
import { jwtPlugin, authMiddleware } from '@/auth/jwt-guard';
import z from 'zod';

export const auth = new Elysia({ prefix: '/auth' })
  .use(jwtPlugin)
  .get('/google', ({ redirect, query }) => {
    const redirectUri = `${env.BASE_URL_API}/auth/google/callback`;
    const clientId = env.GOOGLE_CLIENT_ID;
    const scope = 'openid profile email';

    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', scope);
    url.searchParams.set('access_type', 'offline');
    url.searchParams.set('prompt', 'consent');
    url.searchParams.set('state', query.redirect);

    return redirect(url.toString());
  }, {
    query: z.object({
      redirect: z.string().startsWith('/')
    })
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
      name: user.name,
      email: user.email,
    });

    const url = env.BASE_URL_WEB + `/auth/callback?token=${token}&redirect=${query.state}`;
    return redirect(url);
  })
  .use(authMiddleware)
  .guard({ auth: true })
  .get('/me', ({ user }) => {
    return prisma.user.findUniqueOrThrow({ where: { id: user.id } });
  })
  .patch('/me', ({ user, body }) => {
    return prisma.user.update({
      where: {
        id: user.id
      },
      data: body
    });
  }, {
    body: z.object({
      name: z.string().min(2).max(100).optional(),
      weight: z.number().optional(),
      calorie: z.number().optional(),
      weightGoal: z.number().optional(),
    })
  });
