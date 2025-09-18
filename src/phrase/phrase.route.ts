import { Elysia } from 'elysia';
import { paramsSchema } from '@/utils/params.schema';
import { PhraseService } from '@/phrase/phrase.service';
import { PhraseModel } from '@/phrase/phrase.model';

export const phraseRoute = new Elysia({ prefix: '/phrases' })
  .decorate('phraseService', new PhraseService())
  .post('/', ({ body, phraseService }) => phraseService.create(body), { 
    body: PhraseModel.createBody
  })
  .get('/', ({ phraseService }) => phraseService.findAll())
  .guard({ params: paramsSchema })
  .get('/:id', ({ params, phraseService }) => phraseService.findOne(params.id))
  .patch('/:id', ({ params, body, phraseService }) => phraseService.update(params.id, body),{
    body: PhraseModel.updateBody 
  })
  .delete('/:id', ({ params, phraseService }) => phraseService.delete(params.id));
