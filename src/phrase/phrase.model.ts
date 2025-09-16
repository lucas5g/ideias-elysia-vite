import { t, Static } from 'elysia';
export const createPhraseSchema = t.Object({
  portuguese: t.String(),
  english: t.Optional(t.String()),
  tags: t.Array(t.String()),
});

export const updatePhraseSchema = t.Partial(createPhraseSchema);
export const findAllPhraseSchema = t.Partial(createPhraseSchema);

export type CreatePhraseDto = Static<typeof createPhraseSchema>
export type UpdatePhraseDto = Static<typeof updatePhraseSchema>
export type FindAllPhraseDto = Static<typeof findAllPhraseSchema>
