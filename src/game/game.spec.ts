import { describe, it, beforeAll, afterAll, expect } from 'bun:test';
import { GameService } from '@/game/game.service';
import { CreateGameDto, UpdateGameDto } from '@/game/game.model';

describe('GameService', () => {
  const service = new GameService();
  let createdId: number;

  beforeAll(async () => {
    const payload: CreateGameDto = {
      name: 'Test name',
  description: 'Test description',
  category: 'Test category',
    };
    const res = await service.create(payload);
    createdId = res.id;
  });

  afterAll(async () => {
    await service.delete(createdId);
  });

  it('findAll', async () => {
    const res = await service.findAll();
    expect(res).toBeArray();
  });

  it('findOne', async () => {
    const res = await service.findOne(createdId);
    expect(res).toHaveProperty('id', createdId);
  });

  it('update', async () => {
    const payload: UpdateGameDto = {
      name: 'Updated name',
  description: 'Updated description',
  category: 'Updated category',
    };
    const res = await service.update(createdId, payload);
    expect(res).toMatchObject(payload);
  });
});
