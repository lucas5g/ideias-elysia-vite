import { Elysia } from 'elysia';
import { paramsSchema } from '@/utils/params.schema';
import { PhraseService } from '@/phrase/phrase.service';
import { createPhraseSchema, updatePhraseSchema } from '@/phrase/phrase.model';

export const phraseRoute = new Elysia({ prefix: '/phrases' })
  .decorate('phraseService', new PhraseService())
  .post('/', ({ body, phraseService }) => phraseService.create(body), {
    body: createPhraseSchema
  })
  .get('/', ({ phraseService }) => phraseService.findAll())
  .guard({ params: paramsSchema })
  .get('/:id', ({ params, phraseService }) => phraseService.findOne(params.id), {
    params: paramsSchema
  })
  .get('/:id/audio', async ({ params, phraseService, set }) => {
    const audio = await phraseService.findOneAudio(params.id);
    set.headers['Content-Type'] = 'audio/mpeg';
    set.headers['Content-Length'] = audio.length.toString();
    return audio;
  })
  .patch('/:id', ({ params, body, phraseService }) => phraseService.update(params.id, body), {
    body: updatePhraseSchema
  })
  .delete('/:id', ({ params, phraseService }) => phraseService.delete(params.id));
