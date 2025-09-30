import { Elysia } from 'elysia';
import { paramsSchema } from '@/utils/params.schema';
import { FoodService } from '@/food/food.service';
import { FoodModel } from '@/food/food.model';

export const food = new Elysia({ prefix: '/foods' })
  .post('/', ({ body }) => FoodService.create(body), { 
    body: FoodModel.createBody
  })
  .get('/', ({ query }) => FoodService.findAll(query), {
    query: FoodModel.findAllQuery
  })
  .guard({ params: paramsSchema })
  .get('/:id', ({ params }) => FoodService.findOne(params.id))
  .patch('/:id', ({ params, body }) => FoodService.update(params.id, body),{
    body: FoodModel.updateBody 
  })
  .delete('/:id', ({ params }) => FoodService.delete(params.id));
