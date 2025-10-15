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

  it('findAllGroupByMeal', async () => {
    const res = await DietService.findAllGroupByMeal();
    expect(Object.keys(res)).toEqual(Object.values(Meal));

    const properties = ['protein', 'fat', 'carbo', 'fiber', 'calorie', 'quantity'];
    expect(Object.keys(res.BREAKFAST.total)).toEqual(properties);
  });


  it('report', async () => {
    const res = await DietService.report();

    const weight = res.find(item => item.name === 'weight');
    expect(weight).toHaveProperty('total');

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



  // it.only('report')
});
