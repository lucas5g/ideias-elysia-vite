import { Elysia } from 'elysia';
import { paramsSchema } from '@/utils/params.schema';
import { PhraseService } from '@/phrase/phrase.service';
import { createPhraseSchema, updatePhraseSchema } from '@/phrase/phrase.model';

const phraseService = new PhraseService();

export const phraseRoute = (app: Elysia) =>
  app.group('/phrases', app =>
    app
      .get('/', () => phraseService.findAll())
      .get('/:id', ({ params }) => phraseService.findOne(params.id), {
        params: paramsSchema
      })
      .get('/:id/audio.mp3', async ({ params }) => {
        const audio = await phraseService.findOneAudio(params.id);
        return new Response(audio, {
          status: 200,
          headers: {
            'Content-Type': 'audio/mpeg',
            'Content-Length': audio.length.toString()
          }
        });


      }, {
        params: paramsSchema
      })
      .post('/', ({ body }) => phraseService.create(body), {
        body: createPhraseSchema
      })
      .patch('/:id', ({ params, body }) => phraseService.update(params.id, body), {
        params: paramsSchema,
        body: updatePhraseSchema
      })
      .delete('/:id', ({ params }) => phraseService.delete(params.id), {
        params: paramsSchema
      })
  );
