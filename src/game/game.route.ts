import { Elysia } from 'elysia';
import { paramsSchema } from '@/utils/params.schema';
import { GameService } from '@/game/game.service';
import { createGameSchema, updateGameSchema } from '@/game/game.model';

export const gameRoute = new Elysia({ prefix: '/games' })
  .decorate('gameService', new GameService())
  .post('/', ({ body, gameService }) => gameService.create(body), { 
    body: createGameSchema 
  })
  .get('/', ({ gameService }) => gameService.findAll())
  .guard({ params: paramsSchema })
  .get('/:id', ({ params, gameService }) => gameService.findOne(params.id))
  .patch('/:id', ({ params, body, gameService }) => gameService.update(params.id, body),{
    body: updateGameSchema 
  })
  .delete('/:id', ({ params, gameService }) => gameService.delete(params.id));
