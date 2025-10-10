import { describe, it, beforeAll, afterAll, expect } from 'bun:test';
import { DietService } from '@/diet/diet.service';
import { Meal } from '@prisma/client';

describe('DietService', () => {
  let id: number;

  beforeAll(async () => {
    const payload = {
      meal: Meal.BREAKFAST,
      foodId: 19,
      quantity: 123,
      protein: 123,
      fat: 123,
      carbo: 123,
      fiber: 123,
      calorie: 123,
    };
    const created = await DietService.create(payload);
    id = created.id;
  });

  afterAll(async () => {
    await DietService.delete(id);
  });

  it('findAll', async () => {
    const res = await DietService.findAll();
    expect(res).toBeArray();
  });

  it('findOne', async () => {
    const record = await DietService.findOne(id);
    expect(record).toHaveProperty('id', id);
  });

  it('update', async () => {
    const payload = {
      meal: Meal.LUNCH,
    };
    const res = await DietService.update(id, payload);
    expect(res).toMatchObject(payload);
  });
});
