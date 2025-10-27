import Elysia from 'elysia';
import jwt from '@elysiajs/jwt';

export type UserAuthType = {
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

// Auth middleware similar ao better-auth
export const authMiddleware = new Elysia({ name: 'auth-middleware' })
  .use(jwtPlugin)
  .macro({
    auth: {
      async resolve({ set, headers, jwt }) {
        const token = headers['authorization']?.replace('Bearer ', '');
        const message = JSON.stringify({ message: 'Unauthorized' });

        const user = await jwt.verify(token) as UserAuthType | false;
        if (!user) {
          set.status = 401;
          throw new Error(message);
        }

        return {
          user,
        };
      },
    },
  });
