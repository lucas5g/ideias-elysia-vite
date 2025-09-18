import { describe, it, beforeAll, afterAll, expect } from 'bun:test';
import { PhraseService } from '@/phrase/phrase.service';

describe('PhraseService', () => {
  let id: number;

  beforeAll(async () => {
    const payload = {
      portuguese: 'test',
      english: 'test',
      tags: ['test1', 'test2'],
    };
    const created = await PhraseService.create(payload);
    id = created.id;
  });

  afterAll(async () => {
    await PhraseService.delete(id);
  });

  it('findAll search=quero', async () => {
    const res = await PhraseService.findAll({ portuguese : 'quero' });

    expect(res.every((phrase) => phrase.portuguese.includes('quero'))).toBe(true);

  });

  it('findAll', async () => {
    const res = await PhraseService.findAll();
    expect(res).toBeArray();
  });

  it('findOne', async () => {
    const record = await PhraseService.findOne(id);
    expect(record).toHaveProperty('id', id);
  });

  it('update', async () => {
    const payload = {
      portuguese: 'Updated portuguese',
    };
    const res = await PhraseService.update(id, payload);
    expect(res).toMatchObject(payload);
  });
});
