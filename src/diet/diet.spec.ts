import { describe, it, beforeAll, afterAll, expect } from 'bun:test';
import { DietService } from '@/diet/diet.service';
import { Meal } from '@prisma/client';
import { DietModel } from '@/diet/diet.model';

describe('DietService', () => {
  let id: number;

  beforeAll(async () => {
    const payload: DietModel.createBody = {
      meal: Meal.BREAKFAST,
      foodId: 3,
      quantity: 1,

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

  it('report', async () => {
    const res = await DietService.report();

    expect(res).toBeObject();
  });
});
