import { t, Static } from 'elysia';

export const createGameSchema = t.Object({
  name: t.String({ minLength: 2 }),
  description: t.String({ minLength: 2 }),
  category: t.String({ minLength: 2 }),
});

export const updateGameSchema = t.Partial(createGameSchema);
export const findAllGameSchema = t.Partial(createGameSchema);

export type CreateGameDto = Static<typeof createGameSchema>;
export type UpdateGameDto = Static<typeof updateGameSchema>;
export type FindAllGameDto = Static<typeof findAllGameSchema>;
