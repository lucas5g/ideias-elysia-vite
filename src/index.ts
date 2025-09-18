import { gameRoute } from '@/game/game.route';
import { Elysia } from 'elysia';
import cors from '@elysiajs/cors';
import { phraseRoute } from '@/phrase/phrase.route';
import { env } from '@/utils/env';

import openapi from '@elysiajs/openapi';
import { prismaException } from './utils/prisma-exception';
new Elysia()
  .use(prismaException)
  .use(cors())
  .use(openapi())
  .get('/', ({ redirect }) => redirect('/openapi'))
  .use(phraseRoute)
  .use(gameRoute)
  .listen(3000);

console.debug(
  `🦊 Elysia is running at ${env.BASE_URL_API}`
);

