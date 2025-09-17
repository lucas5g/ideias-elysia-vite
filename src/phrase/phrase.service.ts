import { prisma } from '@/utils/prisma';
import { CreatePhraseDto, UpdatePhraseDto, FindAllPhraseDto } from '@/phrase/phrase.model';
import { Phrase } from '@prisma/client';
import { elevenLabs } from '@/utils/eleven-labs';
import { gemini } from '@/utils/gemini';
import { env } from '@/utils/env';

export class PhraseService {
  async findAll(where?: FindAllPhraseDto) {
    const res = await prisma.phrase.findMany({
      where: {
        portuguese: { contains: where?.portuguese },
        english: { contains: where?.english },
        tags: where?.tags && {
          hasSome: where?.tags
        }
      }      
    });

    return res.map(this.response);
  }

  async findOne(id: number) {
    const res = await prisma.phrase.findUniqueOrThrow({
      where: {
        id
      }
    });
    return this.response(res);
  }

  async findOneAudio(id: number) {
    const res = await prisma.phrase.findUniqueOrThrow({
      where: {
        id
      }
    });
    return Buffer.from(res.audio);
  }

  async create(data: CreatePhraseDto) {
    const english = await gemini(data.portuguese);
    return prisma.phrase.create({
      data: {
        ...data,
        english,
        audio: await elevenLabs(english)
      }
    });
  }

  update(id: number, data: UpdatePhraseDto) {
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
      audio: `${env.BASE_URL_API}/phrases/${phrase.id}/audio.mp3`,
      tags: phrase.tags
    };
  }
}
