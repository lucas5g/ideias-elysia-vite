import { prisma } from '@/utils/prisma';
import { PhraseModel } from '@/phrase/phrase.model';
import { translate } from '@/utils/translate';
import { elevenLabs } from '@/utils/eleven-labs';
import { Phrase } from '@prisma/client';
import { env } from '@/utils/env';
import { transcribe } from '@/utils/transcribe';

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

  static async createOld(data: PhraseModel.createBody) {
    const english = await translate(data.portuguese);
    return prisma.phrase.create({
      data: {
        ...data,
        english,
        audio: await elevenLabs(english)
      }
    });

  }

  static async create(data: PhraseModel.createBodyV2) {

    if (data.type === 'TRANSLATE') {

      const english = await translate(data.portuguese!);

      return prisma.phrase.create({
        data: {
          audio: await elevenLabs(english),
          english,
          portuguese: data.portuguese!,
          tags: data.tags,
        }
      });
    }

    const audioTranscribe = await transcribe({ file: data.audio!, type: data.type });

    return audioTranscribe;
    // console.log({ audioTranscribe });

    // return prisma.phrase.create({
    //   data: {
    //     portuguese: await transla
    //     audio: , 
    //   }
    // });

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
