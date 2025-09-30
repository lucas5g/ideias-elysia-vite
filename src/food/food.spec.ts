import { describe, it, beforeAll, afterAll, expect } from 'bun:test';
import { FoodService } from '@/food/food.service';

describe('FoodService', () => {
  let id: number;

  beforeAll(async () => {
    const payload = {
      name: 'Test name',
  protein: 123,
  fat: 123,
  carbo: 123,
  fiber: 123,
  calorie: 123,
    };
    const created = await FoodService.create(payload);
    id = created.id;
  });

  afterAll(async () => {
    await FoodService.delete(id);
  });

  it('findAll', async () => {
    const res = await FoodService.findAll();
    expect(res).toBeArray();
  });

  it('findOne', async () => {
    const record = await FoodService.findOne(id);
    expect(record).toHaveProperty('id', id);
  });

  it('update', async () => {
    const payload = {
      name: 'Updated name',
    };
    const res = await FoodService.update(id, payload);
    expect(res).toMatchObject(payload);
  });
});
