import { gameRoute } from '@/game/game.route';
import { Elysia } from 'elysia';
import cors from '@elysiajs/cors';
import { env } from '@/utils/env';
import { phraseRoute } from './phrase/phrase.route';

import openapi from '@elysiajs/openapi';
new Elysia()
  .use(cors())
  .use(openapi())
  .get('/', ({ redirect }) => redirect('/openapi'))
  .use(phraseRoute)
  .use(gameRoute)
  .listen(3000);

console.debug(
  `🦊 Elysia is running at ${env.BASE_URL_API}`
);

