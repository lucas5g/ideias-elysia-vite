import { prisma } from '@/utils/prisma';
import { PhraseModel } from '@/phrase/phrase.model';
import { gemini } from '@/utils/gemini';
import { elevenLabs } from '@/utils/eleven-labs';

export class PhraseService {
  findAll(where?: PhraseModel.findAllQuery) {
    return prisma.phrase.findMany({
      where: {
        portuguese: { contains: where?.portuguese },
        english: { contains: where?.english },
        tags: where?.tags && {
          hasSome: where?.tags
        }
      }
    });
  }

  findOne(id: number) {
    return prisma.phrase.findUniqueOrThrow({ where: { id } });
  }

  async create(data: PhraseModel.createBody) {
    const english = await gemini(data.portuguese);
    return prisma.phrase.create({
      data: {
        ...data,
        english,
        audio: await elevenLabs(english)
      }
    });

  }

  update(id: number, data: PhraseModel.updateBody) {
    return prisma.phrase.update({ where: { id }, data });
  }

  delete(id: number) {
    return prisma.phrase.delete({ where: { id } });
  }
}
