import { prisma } from '@/utils/prisma';
import { DietModel } from '@/diet/diet.model';
import { Food, Meal } from '@prisma/client';

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
          },
        },
      },
      orderBy: [
        { meal: 'asc' },
        { food: { name: 'asc' } }
      ]
    });

    return res.map(diet => ({
      id: diet.id,
      meal: diet.meal,
      foodId: diet.food.id,
      food: diet.food.name,
      quantity: diet.quantity,
      protein: quantity(diet.food.protein, diet.quantity),
      fat: quantity(diet.food.fat, diet.quantity),
      carbo: quantity(diet.food.carbo, diet.quantity),
      fiber: quantity(diet.food.fiber, diet.quantity),
      calorie: quantity(diet.food.calorie, diet.quantity),
    }));
  }

  static async findAllGroupByMeal() {
    const res = await this.findAll();

    return res.reduce((acc, curr) => {
      const meal = curr.meal;
      if (!acc[meal]) {
        acc[meal] = { 
          foods: [],
          total: {
            protein: 0, fat: 0, carbo: 0, fiber: 0, calorie: 0, quantity: 0
          }
        };
      }

      acc[meal].foods.push({
        id: curr.id,
        foodId: curr.foodId,
        name: curr.food,
        quantity: curr.quantity,
        calorie: curr.calorie,
        protein: curr.protein,
        fat: curr.fat,
        carbo: curr.carbo,
        fiber: curr.fiber,
      });
      acc[meal].total = {
        protein: acc[meal].total.protein  + curr.protein,
        fat: acc[meal].total.fat  + curr.fat,
        carbo: acc[meal].total.carbo  + curr.carbo,
        fiber: acc[meal].total.fiber  + curr.fiber,
        calorie: acc[meal].total.calorie  + curr.calorie,
        quantity: acc[meal].total.quantity  + curr.quantity,

      };

      return acc;
    }, {} as Record<Meal, {
      foods: (Omit<Food, 'createdAt' | 'updatedAt'> & { foodId: number, quantity: number })[];
      total: Omit<Food, 'createdAt' | 'updatedAt' | 'id' | 'name'> & { quantity: number };
    }>);


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

  static async report() {
    const [user, diets] = await Promise.all([
      prisma.user.findFirstOrThrow(),
      this.findAll(),

    ]);

    const toFixed = (num: number) => Number(num.toFixed(2));

    const macros = diets.reduce((acc, curr) => {
      acc.protein += curr.protein;
      acc.fat += curr.fat;
      acc.carbo += curr.carbo;
      acc.fiber += curr.fiber;
      acc.calorie += curr.calorie;
      return acc;
    }, { protein: 0, fat: 0, carbo: 0, fiber: 0, calorie: 0, weight: 0 });

    macros.weight = user.weight;

    // Definir metas padrão baseadas no peso (você pode ajustar essas fórmulas)
    const goals = {
      weight: 76.5, // Exemplo: meta de peso
      protein: user.weight * 2, // 2g por kg
      fat: user.weight * 1.0,     // 1g por kg
      carbo: user.weight * 4.0,   // 4g por kg
      fiber: user.weight * 1,                  // 25g fixo
      calorie: user.calorie  // 30 kcal por kg
    };

    return Object.entries(macros).map(([name, total]) => ({
      name,
      total: toFixed(total),
      goal: goals[name as keyof typeof goals],
      diff: toFixed((goals[name as keyof typeof goals] ?? 0) - total)
    }));
  }

}
