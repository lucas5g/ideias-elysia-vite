import { Type } from '@prisma/client';
import z from 'zod';
export namespace PhraseModel {

  export const createBody = z
    .object({
      type: z.enum(Type),
      tags: z.array(z.string().min(1)).min(1),
      portuguese: z.string().min(2).optional(),
      audio: z.file().mime('audio/ogg').optional(),
    })
    .refine((data) => !(data.type === 'TRANSLATION' && !data.portuguese), {
      message: 'Portuguese text is required',
      path: ['portuguese'],
    })
    .refine((data) => !(['INTERROGATIVE', 'NEGATIVE', 'AFFIRMATIVE'].includes(data.type) && !data.audio), {
      message: 'Audio file is required',
      path: ['audio'],
    });

  export const createHistoryBody = z
    .object({
      tag: z.string().min(2),
    });



  export const updateBody = createBody.partial().extend({
    english: z.string().optional(),
  });
  export const findAllQuery = createBody.partial().extend({
    search: z.string().optional(),
    english: z.string().optional(),
  });

  export type createBody = z.infer<typeof createBody>;
  export type updateBody = z.infer<typeof updateBody>;
  export type findAllQuery = z.infer<typeof findAllQuery>;
  export type createHistoryBody = z.infer<typeof createHistoryBody>;

} 