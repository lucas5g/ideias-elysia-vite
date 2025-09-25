import { prisma } from '@/utils/prisma';
import { PhraseModel } from '@/phrase/phrase.model';
import { elevenLabs } from '@/utils/eleven-labs';
import { Phrase, Prisma } from '@prisma/client';
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
        },
      orderBy: {
        createdAt: 'asc'
      }
    });
    return phrases.map((phrase) => this.response(phrase));
  }

  static findOne(id: number) {
    return prisma.phrase.findUniqueOrThrow({ where: { id } });
  }

  static async create(body: PhraseModel.createBody) {
   
    const data = await PhraseService.prepareCreate(body);

    const res = await prisma.phrase.create({
      data
    });

    return this.response(res);
  }


  static update(id: number, data: PhraseModel.updateBody) {
    return prisma.phrase.update({
      where: { id },
      data: {
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
      audioUrl: `${env.BASE_URL_API}/phrases/${phrase.id}/audio`,
      tags: phrase.tags,
      type: phrase.type
    };
  }

  static async createHistory(data: PhraseModel.createHistoryBody) {

    const [, phrases] = await prisma.$transaction([
      prisma.phrase.deleteMany({
        where: {
          type: 'STORY',
          tags: {
            has: data.tag
          }
        }
      }),
      prisma.phrase.findMany({
        where: {
          tags: {
            has: data.tag
          }
        }
      })
    ]);

    const phraseEnglish = phrases.map((phrase) => phrase.english);

    const english = await Gemini.createHistory(phraseEnglish, data.tag);
    const portuguese = await Gemini.translate(english, 'portuguese');
    const audio = await elevenLabs(english);

    return await prisma.phrase.create({
      data: {
        audio,
        english,
        portuguese,
        tags: [data.tag],
        type: 'STORY'
      }
    });    
  }

  private static async  prepareCreate(data: PhraseModel.createBody):Promise<Prisma.PhraseCreateInput> {
    //clean tags 
    data.tags = [...new Set(data.tags)];

    if (data.type === 'TRANSLATION') {
      const english = await Gemini.translate(data.portuguese!);
      return {
        ...data,
        portuguese: data.portuguese!,
        english,
        audio: await elevenLabs(english)
      };
    }

    if (data.type === 'INTERROGATIVE' || data.type === 'NEGATIVE') {
      const english = await Gemini.transcribe({ file: data.audio!, type: data.type });

      const [portuguese, audio] = await Promise.all([
        Gemini.translate(english, 'portuguese'),
        elevenLabs(english)
      ]);

      return {
        ...data,
        english,
        portuguese,
        audio
      };
    }

    if (data.type === 'STORY'){
      const phrases = await prisma.phrase.findMany({
        where: {
          tags: {
            hasSome: data.tags
          }
        }
      }); 

      const phrasesEnglish  = phrases.map((phrase) => phrase.english);

      const english = await Gemini.createHistory(phrasesEnglish);
      const portuguese = await Gemini.translate(english, 'portuguese');
      const audio = await elevenLabs(english);

      return {
        ...data,
        english,
        portuguese,
        audio
      };

    }

    throw new Response('Invalid type', { status: 400 });

  }
}
