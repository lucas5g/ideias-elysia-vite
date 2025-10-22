import { Meal } from '@prisma/client';
import { z } from 'zod';

export namespace DietModel {
  export const createBody = z.object({
    meal: z.enum(Meal),
    foodId: z.number(),
    quantity: z.number(),
    date: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: 'Invalid date format',
    }),  
  });

  export const updateBody = createBody.partial();
  export const findAllQuery = createBody.partial();

  export type createBody = z.infer<typeof createBody>;
  export type updateBody = z.infer<typeof updateBody>;
  export type findAllQuery = z.infer<typeof findAllQuery>;
}