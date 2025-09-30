import { describe, it, beforeAll, afterAll, expect } from 'bun:test';
import { GameService } from '@/game/game.service';

describe('GameService', () => {
  let id: number;

  beforeAll(async () => {
    const payload = {
      name: 'Test name',
  description: 'Test description',
  category: 'Test category',
    };
    const created = await GameService.create(payload);
    id = created.id;
  });

  afterAll(async () => {
    await GameService.delete(id);
  });

  it('findAll', async () => {
    const res = await GameService.findAll();
    expect(res).toBeArray();
  });

  it('findOne', async () => {
    const record = await GameService.findOne(id);
    expect(record).toHaveProperty('id', id);
  });

  it('update', async () => {
    const payload = {
      name: 'Updated name',
    };
    const res = await GameService.update(id, payload);
    expect(res).toMatchObject(payload);
  });
});
