import { prisma } from '@/utils/prisma';
import { DietModel } from '@/diet/diet.model';

export abstract class DietService {
  static findAll(where?: DietModel.findAllQuery) {
    return prisma.diet.findMany({
      where,
    });
  }

  static findOne(id: number) {
    return prisma.diet.findUniqueOrThrow({ where: { id } });
  }

  static async create(data: DietModel.createBody) {
    const food = await prisma.food.findUniqueOrThrow({
      where: { id: data.foodId }
    });

    const quantity = (macro: number) => Number((macro * data.quantity / 100).toFixed(2));

    return prisma.diet.create({
      data: {
        ...data,
        protein: quantity(food.protein),
        fat: quantity(food.fat),
        carbo: quantity(food.carbo),
        fiber: quantity(food.fiber),
        calorie: quantity(food.calorie),
      }
    });
  }

  static update(id: number, data: DietModel.updateBody) {
    return prisma.diet.update({ where: { id }, data });
  }

  static delete(id: number) {
    return prisma.diet.delete({ where: { id } });
  }
}
