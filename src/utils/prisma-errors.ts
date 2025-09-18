import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export function prismaErrors(exception: PrismaClientKnownRequestError){
  const code = exception.code;

  if (code === 'P2002') {
    return 'Unique constraint failed';
  }

  return 'Unknown error';

}