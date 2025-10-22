import { video } from '@/video/video';
import { user } from '@/user/user';
import { diet } from '@/diet/diet';
import { food } from '@/food/food';
import { Elysia, redirect } from 'elysia';
import cors from '@elysiajs/cors';
import { env } from '@/utils/env';
import { version } from '../package.json';

import openapi from '@elysiajs/openapi';
import { prismaException } from './utils/prisma-exception';
import { z } from 'zod';
import { phrase } from '@/phrase/phrase';
import staticPlugin from '@elysiajs/static';
import { meal } from '@/meal/meal';

// console.log(auth.handler());
new Elysia()
.use(prismaException)
.use(cors())
.use(staticPlugin({
  assets: process.cwd() + '/public',
  prefix: '/',
  
  
}))
.use(openapi({
  mapJsonSchema: {
    zod: z.toJSONSchema
    },
    documentation: {
      info: {
        title: 'Ideias API',
        version
      }
    }
  }))
  .get('/', () => redirect('/openapi'))
  .use(phrase)
  .use(food)
  .use(meal)
  .use(diet)
  .use(user)
  .use(video)
  // .mount('/auth',auth.handler)
  .listen(3000);
  
  console.debug(
    `🦊 Elysia is running at ${env.BASE_URL_API} v${version}`
  );
  
  