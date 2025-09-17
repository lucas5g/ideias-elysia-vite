import { describe, it, beforeAll, afterAll, expect, afterEach } from 'bun:test';
import { PhraseService } from '@/phrase/phrase.service';
import { CreatePhraseDto, UpdatePhraseDto } from '@/phrase/phrase.model';

describe('PhraseService', () => {
  const service = new PhraseService();
  let createdId: number;

  beforeAll(async () => {
    const payload: CreatePhraseDto = {
      portuguese: 'test',
      tags: ['test', 't2']
    };
    const res = await service.create(payload);
    createdId = res.id;
  });

  afterAll(async () => {
    await service.delete(createdId);
  });

  it('findAll tags=t1', async () => {

    const dto = {
      tags: ['t2']
    }

    const res = await service.findAll(dto);

    for (const phrase of res) {
      // expect(phrase.tags.).toEqual(dto.tags);
    }
  })

  return
  it('findAll', async () => {
    const res = await service.findAll();
    for (const phrase of res) {
      expect(Object.keys(phrase)).toEqual(['id', 'portuguese', 'english', 'audio', 'tags']);
    }
    expect(res).toBeArray();
  });
  
  it('findOne', async () => {
    const res = await service.findOne(createdId);
    expect(res).toHaveProperty('id', createdId);
  });

  it('update', async () => {
    const payload: UpdatePhraseDto = {
      tags: ['test', 't2']
    };
    const res = await service.update(createdId, payload);
    expect(res).toMatchObject(payload);
  });
});
