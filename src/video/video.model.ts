import { z } from 'zod';

export namespace VideoModel {
  export const createBody = z.object({
    title: z.string().min(2),
    url: z.string().min(2),
    currentTime: z.number(),
    pauseMinutes: z.number(),
    lastPlayed: z.iso.datetime(),
  });

  export const updateBody = createBody.partial();
  export const findAllQuery = createBody.partial();

  export type createBody = z.infer<typeof createBody>;
  export type updateBody = z.infer<typeof updateBody>;
  export type findAllQuery = z.infer<typeof findAllQuery>;
}