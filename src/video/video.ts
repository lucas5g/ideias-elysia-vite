import { Elysia } from 'elysia';
import { paramsSchema } from '@/utils/params.schema';
import { VideoService } from '@/video/video.service';
import { VideoModel } from '@/video/video.model';

export const video = new Elysia({ prefix: '/videos' })
  .post('/', ({ body }) => VideoService.create(body), { 
    body: VideoModel.createBody
  })
  .get('/', ({ query }) => VideoService.findAll(query), {
    query: VideoModel.findAllQuery
  })
  .guard({ params: paramsSchema })
  .get('/:id', ({ params }) => VideoService.findOne(params.id))
  .patch('/:id', ({ params, body }) => VideoService.update(params.id, body),{
    body: VideoModel.updateBody 
  })
  .delete('/:id', ({ params }) => VideoService.delete(params.id));
