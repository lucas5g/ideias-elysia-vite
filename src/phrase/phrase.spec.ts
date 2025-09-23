import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { PhraseService } from '@/phrase/phrase.service';
import { PhraseModel } from '@/phrase/phrase.model';
import fs from 'fs/promises';
import { Type } from '@prisma/client';

describe('PhraseService', () => {

  let id: number;

  // it('crete NEGATIVE', async () => {
  //   await createTranslate('NEGATIVE');
  // }, 8000);

  // it('crete INTERROGATIVE', async () => {
  //   await createTranslate('INTERROGATIVE');
  // }, 8000);


  beforeAll(async () => {
    const payload: PhraseModel.createBody = {
      type: 'TRANSLATION',
      portuguese: 'test',
      tags: ['t1'],
    };
    const created = await PhraseService.create(payload);
    id = created.id;
  });

  afterAll(async () => {
    await PhraseService.delete(id);
  });

  it('findAll search=quero', async () => {
    const res = await PhraseService.findAll({ search: 'quero' });

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

export async function createTranslate(type: Type) {

  const file = __dirname + '/phrase.ogg';

  const fileBuffer = await fs.readFile(file);


  const paylaod: PhraseModel.createBody = {
    type,
    tags: ['test1'],
    audio: new File([new Uint8Array(fileBuffer)], 'phrase.ogg', { type: 'audio/mpeg' })
  };

  const res = await PhraseService.create(paylaod);

  expect(res.english).toBe(
    type === 'NEGATIVE'
      ? 'The church is not far from here.'
      : 'Is the church far from here?'
  );
  await PhraseService.delete(res.id);

}