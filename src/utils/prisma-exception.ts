import { Prisma } from '@prisma/client';
import { Elysia } from 'elysia';

export const prismaException = () =>
  new Elysia().onError(({ error, status }) => {

    if (error instanceof Prisma.PrismaClientInitializationError) {
      return status(500, {
        message: 'Database connection error',
        status: 500
      });
    }


    if (error instanceof Prisma.PrismaClientKnownRequestError) {


      if (error.code === 'P2025') { // Record not found
        return status(404, {
          message: error.meta?.modelName + ' not found.',
          status: 404
        });
      }

      if (error.code === 'P2002') { // Unique constraint failed
        return status(400, {
          message: `${error.meta?.modelName} already exists.`,
          status: 400
        });
      }


      return status(500, {
        message: 'Server error',
      });

    }

  });
