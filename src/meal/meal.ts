import { Meal } from '@prisma/client';
import Elysia from 'elysia';

export const meal = new Elysia({ prefix: '/meals' })  
  .get('/', () => Object.values(Meal));