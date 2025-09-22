import { Type } from '@prisma/client';
import { t } from 'elysia';

export namespace PhraseModel {
  export const createBody = t.Object({
    portuguese: t.String({ minLength: 2 }),
    english: t.Optional(t.String({ minLength: 2 })),
    tags: t.Array(t.String({ minLength: 2 }), { minItems: 1 }),
  });

  export const createBodyV2 = t.Object({
    type: t.Enum(Type),
    audio: t.Optional(t.File({ maxSize: 3 * 1024 })),
    portuguese: t.Optional(t.String({ minLength: 2 })),
    tags: t.Array(t.String({ minLength: 2 }), { minItems: 1 }),
  });
  // .custom((value: strng) => {
  //   if (value.type === 'TRANSLATE' && !value.portuguese) {
  //     throw new Error('Portuguese is required when type is TRANSLATE');
  //   }
  //   return value;
  // })


  export const updateBody = t.Partial(createBody);
  export const findAllQuery = t.Object({
    ...updateBody.properties,
    search: t.Optional(t.String()),
  });

  export type createBody = typeof createBody.static
  export type updateBody = typeof updateBody.static
  export type findAllQuery = typeof findAllQuery.static
  export type createBodyV2 = typeof createBodyV2.static
} 