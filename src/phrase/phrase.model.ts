import { t } from 'elysia';

export namespace PhraseModel {
  export const createBody = t.Object({
    portuguese: t.String({ minLength: 2 }),
    english: t.Optional(t.String({ minLength: 2 })),
    tags: t.Array(t.String({ minLength: 2 })),
  });

  export const updateBody = t.Partial(createBody);
  export const findAllQuery = t.Object({
    ...updateBody.properties,
    search: t.Optional(t.String()),
  });

  export type createBody = typeof createBody.static
  export type updateBody = typeof updateBody.static
  export type findAllQuery = typeof findAllQuery.static

}