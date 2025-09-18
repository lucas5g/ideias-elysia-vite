import { Elysia } from 'elysia';
import { GameService } from '@/game/game.service';
import { createGameSchema, updateGameSchema } from '@/game/game.model';

export const gameRoute = new Elysia({ prefix: '/games' })
  .decorate('gameService', new GameService())
  // .guard({ params: paramsSchema })
  .get('/', ({ gameService }) => gameService.findAll())
  .get('/:id', ({ params, gameService }) => gameService.findOne(params.id))
  .post('/', ({ body, gameService }) => gameService.create(body), { 
    body: createGameSchema 
  })
  .patch('/:id', ({ params, body, gameService }) => gameService.update(params.id, body),{
    body: updateGameSchema 
  })
  .delete('/:id', ({ params, gameService }) => gameService.delete(params.id));
