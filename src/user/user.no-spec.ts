import { describe, it, beforeAll, afterAll, expect } from 'bun:test';
import { UserService } from '@/user/user.service';

describe('UserService', () => {
  let id: number;

  beforeAll(async () => {
    const payload = {
      weight: 123,
    };
    const created = await UserService.create(payload);
    id = created.id;
  });

  afterAll(async () => {
    await UserService.delete(id);
  });

  it('findAll', async () => {
    const res = await UserService.findAll();
    expect(res).toBeArray();
  });

  it('findOne', async () => {
    const record = await UserService.findOne(id);
    expect(record).toHaveProperty('id', id);
  });

  it('update', async () => {
    const payload = {
      weight: 456,
    };
    const res = await UserService.update(id, payload);
    expect(res).toMatchObject(payload);
  });
});
