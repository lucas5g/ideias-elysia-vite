import { describe, it, beforeAll, afterAll, expect } from 'bun:test';
import { treaty } from '@elysiajs/eden';
import { phraseRoute } from '@/phrase/phrase.route';
import { PhraseModel } from '@/phrase/phrase.model';

describe('Phrase API', () => {
  const api = treaty(phraseRoute);
  let id: number;

  beforeAll(async () => {
    const payload: PhraseModel.createBody = {
      portuguese: 'Test portuguese',
      english: 'Test english',
      tags: ['test1', 'test2'],
    };
    const { data } = await api.phrases.post(payload);
    id = data!.id;
  });

  afterAll(async () => {
    await api.phrases({ id }).delete();
  });

  it('GET', async () => {
    const { data } = await api.phrases.get();

    data?.forEach((phrase) => {
      expect(phrase).toHaveProperty('id');
      expect(phrase).toHaveProperty('audio');
    });
   
    expect(data).toBeArray();
  });

  it('GET /:id', async () => {
    const { data } = await api.phrases({ id }).get();
    expect(data).toHaveProperty('id', id);
  });

  it('PATCH /:id', async () => {
    const payload: PhraseModel.updateBody = {
      portuguese: 'Updated portuguese',
    };
    const { data } = await api.phrases({ id }).patch(payload);
    expect(data).toMatchObject(payload);
  });
});

