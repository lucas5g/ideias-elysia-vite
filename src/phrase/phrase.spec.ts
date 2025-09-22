import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { PhraseService } from '@/phrase/phrase.service';
describe('PhraseService', () => {
  let id: number;

  beforeAll(async () => {
    const payload = {
      type: 'TRANSLATE',
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


  // it('createV2 translate', async () => {
  //   const paylaod: PhraseModel.createBodyV2 = {
  //     type: 'TRANSLATE',
  //     portuguese: 'teste',
  //     tags: ['test1', 'test2'],
  //   };

  //   const res = await PhraseService.createV2(paylaod);

  //   expect(res.english).toBe('test');

  //   await PhraseService.delete(res.id);

  // });


  // it('createV2 negative', async () => {

  //   const file = __dirname + '/phrase.ogg';

  //   const fileBuffer = await fs.readFile(file);


  //   const paylaod: PhraseModel.createBodyV2 = {
  //     type: 'NEGATIVE',
  //     tags: ['test1', 'test2'],
  //     audio: new File([new Uint8Array(fileBuffer)], 'phrase.ogg', { type: 'audio/mpeg' })
  //   };

  //   // console.log({ paylaod })

  //   const res = await PhraseService.createV2(paylaod);

  //   console.log(res);

  //   // await PhraseService.delete(res.id);
  // }, 15_000);
});
