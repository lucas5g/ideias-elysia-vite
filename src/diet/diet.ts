import { Elysia } from 'elysia';
import { paramsSchema } from '@/utils/params.schema';
import { DietService } from '@/diet/diet.service';
import { DietModel } from '@/diet/diet.model';

export const diet = new Elysia({ prefix: '/diets' })
  .post('/', ({ body, set }) => {
    set.status = 201;
    return DietService.create(body);
  },
    {
      body: DietModel.createBody
    })
  .get('/', ({ query }) => DietService.findAll(query), {
    query: DietModel.findAllQuery
  })
  .get('/group-by-meal', () => DietService.findAllGroupByMeal())
  .get('/report', () => DietService.report())
  .guard({ params: paramsSchema })
  .get('/:id', ({ params }) => DietService.findOne(params.id))
  .patch('/:id', ({ params, body }) => DietService.update(params.id, body), {
    body: DietModel.updateBody
  })
  .delete('/:id', ({ params }) => DietService.delete(params.id));
