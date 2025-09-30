import { z } from 'zod';

export namespace FoodModel {
  export const createBody = z.object({
    name: z.string().min(2),
  protein: z.number(),
  fat: z.number(),
  carbo: z.number(),
  fiber: z.number(),
  calorie: z.number(),
  });

  export const updateBody = createBody.partial();
  export const findAllQuery = createBody.partial();
  
  export type createBody = z.infer<typeof createBody>;
  export type updateBody = z.infer<typeof updateBody>;
  export type findAllQuery = z.infer<typeof findAllQuery>;
}