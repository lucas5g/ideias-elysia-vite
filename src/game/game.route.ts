import { Elysia } from 'elysia';
import { paramsSchema } from '@/utils/params.schema';
import { GameService } from '@/game/game.service';
import { GameModel } from '@/game/game.model';

export const gameRoute = new Elysia({ prefix: '/games' })
  .post('/', ({ body }) => GameService.create(body), { 
    body: GameModel.createBody
  })
  .get('/', ({ query }) => GameService.findAll(query), {
    query: GameModel.findAllQuery
  })
  .guard({ params: paramsSchema })
  .get('/:id', ({ params }) => GameService.findOne(params.id))
  .patch('/:id', ({ params, body }) => GameService.update(params.id, body),{
    body: GameModel.updateBody 
  })
  .delete('/:id', ({ params }) => GameService.delete(params.id));
