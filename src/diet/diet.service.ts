import { prisma } from '@/utils/prisma';
import { DietModel } from '@/diet/diet.model';

export abstract class DietService {
  static async findAll(where?: DietModel.findAllQuery) {

    const quantity = (macro: number, qty: number) => Number((macro * qty).toFixed(2));

    const res = await prisma.diet.findMany({
      where,
      select: {
        id: true,
        meal: true,
        quantity: true,
        food: {
          select: {
            id: true,
            name: true,
            protein: true,
            fat: true,
            carbo: true,
            fiber: true,
            calorie: true,
          }
        },      
      }
    });

    return res.map(diet => ({
      id: diet.id,
      meal: diet.meal,
      food:diet.food.name,
      quantity: diet.quantity,
      protein: quantity(diet.food.protein, diet.quantity),
      fat: quantity(diet.food.fat, diet.quantity),
      carbo: quantity(diet.food.carbo, diet.quantity),
      fiber: quantity(diet.food.fiber, diet.quantity),
      calorie: quantity(diet.food.calorie, diet.quantity),
    }));
  }

  static findOne(id: number) {
    return prisma.diet.findUniqueOrThrow({ where: { id } });
  }

  static create(data: DietModel.createBody) {
    return prisma.diet.create({
      data
    });
  }

  static update(id: number, data: DietModel.updateBody) {
    return prisma.diet.update({ where: { id }, data });
  }

  static delete(id: number) {
    return prisma.diet.delete({ where: { id } });
  }
}
