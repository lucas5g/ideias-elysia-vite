import { Elysia } from 'elysia';
import cors from '@elysiajs/cors';
import { phraseRoute } from '@/phrase/phrase.route';

const app = new Elysia()
  .use(cors())
  .get('/', () => 'Hello Elysia')
  .use(phraseRoute)
  .listen(3000);

console.debug(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);
