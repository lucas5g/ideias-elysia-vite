import { Prisma } from '@prisma/client';
import { Elysia } from 'elysia';

export const prismaException = () =>
  new Elysia().onError(({ error, status }) => {

    if (error instanceof Prisma.PrismaClientKnownRequestError) {


      if (error.code === 'P2025') { // Record not found
        return status(404, {
          message: 'not found.',
          status: 404
        });
      }

      return status(500, {
        message: error,
      });

    }

    // Se não for erro do Prisma, deixa o Elysia tratar normalmente
    return error;
  });
