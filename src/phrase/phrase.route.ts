import { Elysia } from 'elysia';
import { paramsSchema } from '@/utils/params.schema';
import { PhraseService } from '@/phrase/phrase.service';
import { PhraseModel } from '@/phrase/phrase.model';

export const phraseRoute = new Elysia({ prefix: '/phrases' })
  .post('/test', ({ body }) => {
    return body;
  })
  .post('/', ({ body, set }) => {
    set.status = 201;
    return PhraseService.create(body);
  },
    {
      body: PhraseModel.createBody
    })
  .get('/', ({ query }) => PhraseService.findAll(query), {
    query: PhraseModel.findAllQuery
  })
  .guard({ params: paramsSchema })
  .get('/:id/audio', async ({ params, set }) => {
    const { audio } = await PhraseService.findOne(params.id);
    set.headers['Content-Type'] = 'audio/mpeg';
    set.headers['Content-Length'] = audio.length.toString();
    return audio;
  })
  .get('/:id', ({ params, }) => PhraseService.findOne(params.id))
  .patch('/:id', ({ params, body, }) => PhraseService.update(params.id, body), {
    body: PhraseModel.updateBody
  })
  .delete('/:id', ({ params }) => PhraseService.delete(params.id));
