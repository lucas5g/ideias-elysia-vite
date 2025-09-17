import { Elysia } from 'elysia';
import cors from '@elysiajs/cors';
import { phraseRoute } from '@/phrase/phrase.route';
import swagger from '@elysiajs/swagger';
import { env } from '@/utils/env';

const app = new Elysia()
  .onError((err) => console.error(err))
  .use(cors())
  .use(swagger())
  .get('/', ({ redirect }) => redirect('/swagger'))
  .use(phraseRoute)
  .listen(3000);

console.debug(
  `🦊 Elysia is running at ${env.BASE_URL_API}`
);

