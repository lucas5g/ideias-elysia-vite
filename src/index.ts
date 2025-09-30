import { food } from '@/food/food';
import { Elysia } from 'elysia';
import cors from '@elysiajs/cors';
import { env } from '@/utils/env';
import { version } from '../package.json';

import openapi from '@elysiajs/openapi';
import { prismaException } from './utils/prisma-exception';
import z from 'zod';
import { phrase } from '@/phrase/phrase';
new Elysia()
  .use(prismaException)
  .use(cors())
  .use(openapi({    
    mapJsonSchema: {
      zod: z.toJSONSchema
    },
    documentation:{
      info:{
        title: 'Ideias API',
        version
      }
    }
  }))
  .get('/', ({ redirect }) => redirect('/openapi'))
  .use(phrase)
  .use(food)
  .listen(3000);

console.debug(
  `🦊 Elysia is running at ${env.BASE_URL_API} v${version}`
);

