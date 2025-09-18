import { Elysia } from 'elysia';
import { paramsSchema } from '@/utils/params.schema';
import { PhraseService } from '@/phrase/phrase.service';
import { createPhraseSchema, updatePhraseSchema } from '@/phrase/phrase.model';

export const phrase = new Elysia({ prefix: '/phrases' })
.decorate('phraseService', new PhraseService())
.guard({ params: paramsSchema })
.get('/', ({ phraseService }) => phraseService.findAll())
.get('/:id', ({ params, phraseService }) => phraseService.findOne(params.id), {
  params: paramsSchema
})
.get('/:id/audio.mp3', async ({ params, phraseService }) => {
  const audio = await phraseService.findOneAudio(params.id);
  return new Response(audio, {
    status: 200,
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Length': audio.length.toString()
    }
  });
})
.post('/', ({ body, phraseService }) => phraseService.create(body), {
  body: createPhraseSchema
})
.patch('/:id', ({ params, body, phraseService }) => phraseService.update(params.id, body), {
  body: updatePhraseSchema
})
.delete('/:id', ({ params, phraseService }) => phraseService.delete(params.id));
