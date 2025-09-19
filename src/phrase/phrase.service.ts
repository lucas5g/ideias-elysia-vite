import { prisma } from '@/utils/prisma';
import { PhraseModel } from '@/phrase/phrase.model';
import { gemini } from '@/utils/gemini';
import { elevenLabs } from '@/utils/eleven-labs';
import { Phrase } from '@prisma/client';
import { env } from '@/utils/env';

export abstract class PhraseService {
  static async findAll(where?: PhraseModel.findAllQuery) {


    const phrases = await prisma.phrase.findMany({
      where: where?.search
        ? {
          OR: [
            { portuguese: { contains: where.search } },
            { english: { contains: where.search } },
            { tags: { hasSome: [where.search] } }
          ]
        } : {
          portuguese: { contains: where?.portuguese },
          english: { contains: where?.english },
          tags: where?.tags && {
            hasSome: where?.tags
          }
        }



    });
    return phrases.map((phrase) => this.response(phrase));
  }

  static findOne(id: number) {
    return prisma.phrase.findUniqueOrThrow({ where: { id } });
  }

  static async create(data: PhraseModel.createBody) {
    const english = await gemini(data.portuguese);
    return prisma.phrase.create({
      data: {
        ...data,
        english,
        audio: await elevenLabs(english)
      }
    });

  }

  static update(id: number, data: PhraseModel.updateBody) {
    return prisma.phrase.update({ where: { id }, data });
  }

  static delete(id: number) {
    return prisma.phrase.delete({ where: { id } });
  }

  static response(phrase: Phrase) {
    return {
      id: phrase.id,
      portuguese: phrase.portuguese,
      english: phrase.english,
      audio: `${env.BASE_URL_API}/phrases/${phrase.id}/audio`,
      tags: phrase.tags
    };
  }
}
