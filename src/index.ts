import { gameRoute } from '@/game/game.route';
import { Elysia } from 'elysia';
import cors from '@elysiajs/cors';
import { env } from '@/utils/env';
import { phraseRoute } from './phrase/phrase.route';

import openapi from '@elysiajs/openapi';
import { prismaException } from './utils/prisma-exception';
new Elysia()
  .use(prismaException)
  .use(cors())
  .use(openapi())
  .get('/', ({ redirect }) => redirect('/openapi'))
  // .get('/', () => 'Hello Elysia')
  .use(phraseRoute)
  .use(gameRoute)
  .listen(3000);

console.debug(
  `🦊 Elysia is running at ${env.BASE_URL_API}`
);

