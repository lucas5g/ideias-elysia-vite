import { z } from 'zod';

export namespace UserModel {
  export const createBody = z.object({
    name: z.string().min(2).max(100),
    weight: z.number(),
    calorie: z.number(),
    email: z.email(),
  });

  export const updateBody = createBody.partial();
  export const findAllQuery = createBody.partial();

  export type createBody = z.infer<typeof createBody>;
  export type updateBody = z.infer<typeof updateBody>;
  export type findAllQuery = z.infer<typeof findAllQuery>;
}