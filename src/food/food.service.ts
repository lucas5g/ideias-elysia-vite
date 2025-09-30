import { prisma } from '@/utils/prisma';
import { FoodModel } from '@/food/food.model';

export abstract class FoodService {
  static findAll(where?: FoodModel.findAllQuery) {
    return prisma.food.findMany({
      where,
    });
  }

  static findOne(id: number) {
    return prisma.food.findUniqueOrThrow({ where: { id } });
  }

  static create(data: FoodModel.createBody) {
    return prisma.food.create({ data });
  }

  static update(id: number, data: FoodModel.updateBody) {
    return prisma.food.update({ where: { id }, data });
  }

  static delete(id: number) {
    return prisma.food.delete({ where: { id } });
  }
}
