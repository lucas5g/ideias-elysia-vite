import { Elysia } from 'elysia';
import { paramsSchema } from '@/utils/params.schema';
import { DietService } from '@/diet/diet.service';
import { DietModel } from '@/diet/diet.model';
import { authMiddleware } from '@/auth/jwt-guard';

export const diet = new Elysia({ prefix: '/diets' })
  .use(authMiddleware)
  .guard({ auth: true })
  .post('/', ({ body, set, user }) => {
    set.status = 201;
    return DietService.create(body, user);
  },
    {
      body: DietModel.createBody
    })
  .get('/', ({ query, user }) => DietService.findAll(query, user), {
    query: DietModel.findAllQuery,
  })
  .get('/group-by-meal', () => DietService.findAllGroupByMeal())
  .get('/report', ({ query, user }) => DietService.report(query, user))
  .guard({ params: paramsSchema })
  .get('/:id', ({ params }) => DietService.findOne(params.id))
  .patch('/:id', ({ params, body }) => DietService.update(params.id, body), {
    body: DietModel.updateBody
  })
  .delete('/:id', ({ params }) => DietService.delete(params.id));
