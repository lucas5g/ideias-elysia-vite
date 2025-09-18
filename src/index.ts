import { gameRoute } from '@/game/game.route';
import { Elysia } from 'elysia';
import cors from '@elysiajs/cors';
import swagger from '@elysiajs/swagger';
import { env } from '@/utils/env';
import { phrase } from './phrase/phrase';

new Elysia()
  .use(cors())
  .use(swagger())
  .get('/', ({ redirect }) => redirect('/swagger'))
  .use(phrase)
  .use(gameRoute)
  .listen(3000);

console.debug(
  `🦊 Elysia is running at ${env.BASE_URL_API}`
);

