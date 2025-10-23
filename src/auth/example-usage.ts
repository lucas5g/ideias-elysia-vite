import Elysia from 'elysia';
import { jwtGuard } from '@/auth/jwt-guard';
import { prisma } from '@/utils/prisma';

// Exemplo 1: Módulo completamente protegido
export const privateModule = new Elysia({ prefix: '/private' })
  .use(jwtGuard) // Aplica o guard em TODAS as rotas desse módulo
  .get('/dados', (context: any) => {
    // Todas as rotas aqui têm acesso ao context.user automaticamente
    return { message: 'Dados privados', userId: context.user.id };
  })
  .get('/perfil', async (context: any) => {
    const userDb = await prisma.user.findUnique({
      where: { id: context.user.id }
    });
    return userDb;
  });

// Exemplo 2: Módulo misto (rotas públicas e privadas)
export const mixedModule = new Elysia({ prefix: '/mixed' })
  // Rotas públicas (sem guard)
  .get('/public', () => {
    return { message: 'Qualquer um pode acessar' };
  })
  // Grupo de rotas protegidas
  .group('/protected', (app) =>
    app
      .use(jwtGuard) // Guard aplicado apenas nesse grupo
      .get('/data', (context: any) => {
        return { userId: context.user.id };
      })
      .post('/create', (context: any) => {
        return { createdBy: context.user.id, data: context.body };
      })
  );
