import { Meal } from '@prisma/client';
import { z } from 'zod';

export namespace DietModel {
  const dateString = z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
    .refine((value) => {
      const date = new Date(`${value}T00:00:00.000Z`);
      return !isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
    }, {
      message: 'Invalid date',
    });

  export const createBody = z.object({
    meal: z.enum(Meal),
    foodId: z.number(),
    quantity: z.number(),
    date: dateString,
  });

  export const updateBody = createBody.partial();
  export const findAllQuery = createBody.partial();
  export const clonePreviousDayBody = z.object({
    targetDate: dateString,
  });

  export type createBody = z.infer<typeof createBody>;
  export type updateBody = z.infer<typeof updateBody>;
  export type findAllQuery = z.infer<typeof findAllQuery>;
  export type clonePreviousDayBody = z.infer<typeof clonePreviousDayBody>;
}
