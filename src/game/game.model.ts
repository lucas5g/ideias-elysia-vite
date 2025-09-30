import { z } from 'zod';

export namespace GameModel {
  export const createBody = z.object({
    name: z.string().min(2),
  description: z.string().min(2),
  category: z.string().min(2),
  });

  export const updateBody = createBody.partial();
  export const findAllQuery = createBody.partial();
  
  export type createBody = z.infer<typeof createBody>;
  export type updateBody = z.infer<typeof updateBody>;
  export type findAllQuery = z.infer<typeof findAllQuery>;
}