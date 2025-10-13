import { z } from 'zod';

export namespace UserModel {
  export const createBody = z.object({
    weight: z.number(),
    calorie: z.number(),
  });

  export const updateBody = createBody.partial();
  export const findAllQuery = createBody.partial();

  export type createBody = z.infer<typeof createBody>;
  export type updateBody = z.infer<typeof updateBody>;
  export type findAllQuery = z.infer<typeof findAllQuery>;
}