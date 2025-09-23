import { prisma } from '@/utils/prisma';
import { PhraseModel } from '@/phrase/phrase.model';
import { elevenLabs } from '@/utils/eleven-labs';
import { Phrase } from '@prisma/client';
import { env } from '@/utils/env';
import { Gemini } from '@/utils/gemini';

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
          tags: where?.tags ? {
            hasSome: where.tags
          } : undefined
        }



    });
    return phrases.map((phrase) => this.response(phrase));
  }

  static findOne(id: number) {
    return prisma.phrase.findUniqueOrThrow({ where: { id } });
  }

  static async create(data: PhraseModel.createBody) {

    const english = data.type === 'TRANSLATION'
      ? await Gemini.translate(data.portuguese!)
      : await Gemini.transcribe({ file: data.audio!, type: data.type });

    const portuguese = data.type === 'TRANSLATION'
      ? data.portuguese!
      : await Gemini.translate(english, 'portuguese');

    const phraseExist = await prisma.phrase.findFirst({
      where: {
        portuguese
      }
    });

    if (phraseExist) {
      throw new Response(
        JSON.stringify({ message: 'Phrase already exists' }),
        { status: 400 }
      );
    }

    const res = await prisma.phrase.create({
      data: {
        audio: await elevenLabs(english),
        english,
        portuguese,
        tags: data.tags,
      }
    });

    return this.response(res);
  }


  static update(id: number, data: PhraseModel.updateBody) {
    return prisma.phrase.update({
      where: { id },
      data:{
        english: data.english,
        portuguese: data.portuguese,
        tags: data.tags
      }
    });
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
