import { Elysia } from 'elysia';
import { paramsSchema } from '@/utils/params.schema';
import { UserService } from '@/user/user.service';
import { UserModel } from '@/user/user.model';

export const user = new Elysia({ prefix: '/users' })
  .post('/', ({ body }) => UserService.create(body), { 
    body: UserModel.createBody
  })
  .get('/', ({ query }) => UserService.findAll(query), {
    query: UserModel.findAllQuery
  })
  .guard({ params: paramsSchema })
  .get('/:id', ({ params }) => UserService.findOne(params.id))
  .patch('/:id', ({ params, body }) => UserService.update(params.id, body),{
    body: UserModel.updateBody 
  })
  .delete('/:id', ({ params }) => UserService.delete(params.id));
