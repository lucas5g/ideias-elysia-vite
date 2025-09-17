import { projectRoute } from '@/project/project.route'
import { projetcRoute } from '@/projetc/projetc.route'
import { userRoute } from '@/user/user.route'
import { Elysia } from 'elysia';
import cors from '@elysiajs/cors';
import { phraseRoute } from '@/phrase/phrase.route';

const app = new Elysia()
  .onError((err) => console.error(err))
  .use(cors())
  .get('/', () => 'Hello Elysia')
  .use(phraseRoute)
  .use(userRoute)
  .use(projetcRoute)
  .use(projectRoute)
  .listen(3000);

console.debug(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);

