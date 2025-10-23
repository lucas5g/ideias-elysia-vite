import Elysia from 'elysia';
import jwt from '@elysiajs/jwt';

export type UserJWT = {
  id: number;
  email: string;
};

// Plugin base com JWT configurado
export const jwtPlugin = new Elysia({ name: 'jwt-plugin' })
  .use(
    jwt({
      name: 'jwt',
      secret: 'segredo-test',
    })
  );

// Guard que injeta o user no contexto (para rotas protegidas)
export const jwtGuard = new Elysia({ name: 'jwt-guard' })
  .use(jwtPlugin)
  .derive(async ({ headers, jwt, set }) => {
    const token = headers['authorization']?.replace('Bearer ', '');

    const user = await jwt.verify(token);
    
    if (!user) {
      set.status = 401;
      throw new Error(JSON.stringify({ message: 'Token inválido' }));
    }

    return { user };
  });
