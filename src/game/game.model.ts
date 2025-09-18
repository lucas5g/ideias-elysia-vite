import { t, Static } from 'elysia';

export namespace GameModel {
  export const createBody = t.Object({
    name: t.String({ minLength: 2 }),
  description: t.String({ minLength: 2 }),
  category: t.String({ minLength: 2 }),
  })

  export const updateBody = t.Partial(createBody)
  export const findAllQuery = t.Partial(createBody)
  
  export type createBody = typeof createBody.static
  export type updateBody = typeof updateBody.static
  export type findAllQuery = typeof findAllQuery.static

}