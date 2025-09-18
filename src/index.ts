import { Elysia } from 'elysia';
import cors from '@elysiajs/cors';
import { phraseRoute } from '@/phrase/phrase.route';
import swagger from '@elysiajs/swagger';
import { env } from '@/utils/env';
import { prismaException } from './utils/prisma-exception';

new Elysia()
  .get('/', ({ redirect }) => redirect('/swagger'))
  .use(cors())
  .use(swagger())
  .use(prismaException)
  .use(phraseRoute)
  .listen(3000);

console.debug(
  `🦊 Elysia is running at ${env.BASE_URL_API}`
);

