import { prisma } from '@/utils/prisma';
import { PhraseModel } from '@/phrase/phrase.model';
import { gemini } from '@/utils/gemini';
import { elevenLabs } from '@/utils/eleven-labs';
import { Phrase } from '@prisma/client';
import { env } from '@/utils/env';

export class PhraseService {
  async findAll(where?: PhraseModel.findAllQuery) {
    const phrases = await prisma.phrase.findMany({
      where: {
        portuguese: { contains: where?.portuguese },
        english: { contains: where?.english },
        tags: where?.tags && {
          hasSome: where?.tags
        }
      }
    });
    return phrases.map((phrase) => this.response(phrase));
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

  response(phrase: Phrase) {
    return {
      id: phrase.id,
      portuguese: phrase.portuguese,
      english: phrase.english,
      audio: `${env.BASE_URL_API}/phrases/${phrase.id}/audio`,
      tags: phrase.tags
    };
  }
}
