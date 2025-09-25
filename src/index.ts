import { Elysia } from 'elysia';
import cors from '@elysiajs/cors';
import { phraseRoute } from '@/phrase/phrase.route';
import { env } from '@/utils/env';
import { version } from '../package.json';

import openapi from '@elysiajs/openapi';
import { prismaException } from './utils/prisma-exception';
import z from 'zod';
new Elysia()
  .use(prismaException)
  .use(cors())
  .use(openapi({
    mapJsonSchema: {
      zod: z.toJSONSchema
    }
  }))
  // .use(staticPlugin({
  //   assets: process.cwd() + '/web/dist',
  //   prefix: '/'
  // }))
  .get('/', ({ redirect }) => redirect('/openapi'))
  // .get('*', file(process.cwd() + '/web/dist/index.html'))
  .use(phraseRoute)
  .listen(3000);

console.debug(
  `🦊 Elysia is running at ${env.BASE_URL_API} v${version}`
);

