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
    // .sort((a, b) => a.positionMeal > b.positionMeal ? true : false);
  }

  static async findAllAggregate() {
    const res = await this.findAll();

    // const groupByMeal: Record<Meal, { protein: number; fat: number; carbo: number; fiber: number; calorie: number; quantity: number; foodId: number; count: number }> 
    const group: Record<Meal | 'ALL', { foods: Omit<Food, 'createdAt' | 'updatedAt'>[], total: Omit<Food, 'id' | 'createdAt' | 'updatedAt' | 'name'> }> = {};
    for (const diet of res) {
      const meal = diet.meal;
      if (!group[meal]) {
        group[meal] = {
          foods: [],
          total: { protein: 0, fat: 0, carbo: 0, fiber: 0, calorie: 0 }          
        };
      }

      if (!group['ALL']) {
        group['ALL'] = {
          foods: [],
          total: { protein: 0, fat: 0, carbo: 0, fiber: 0, calorie: 0 }          
        };
      }


      const protein = group[meal].total.protein + diet.protein;
      const fat = group[meal].total.fat + diet.fat;
      const carbo = group[meal].total.carbo + diet.carbo;
      const fiber = group[meal].total.fiber + diet.fiber;
      const calorie = group[meal].total.calorie + diet.calorie; 


      group[meal].total.protein = protein;
      group[meal].total.fat = fat;
      group[meal].total.carbo = carbo;
      group[meal].total.fiber = fiber;
      group[meal].total.calorie = calorie;

      group.ALL.total.protein = group.ALL?.total.protein + protein;
      group.ALL.total.fat = group.ALL?.total.fat + fat;
      group.ALL.total.carbo = group.ALL?.total.carbo + carbo;
      group.ALL.total.fiber = group.ALL?.total.fiber + fiber;
      group.ALL.total.calorie = group.ALL?.total.calorie + calorie;


      group[meal].foods.push({
        id: diet.foodId,
        name: diet.food,
        protein: diet.protein,
        fat: diet.fat,
        carbo: diet.carbo,
        fiber: diet.fiber,
        calorie: diet.calorie,
      });

    }

    return group;

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
    //fazer reduce com os macros

    const macros = diets.reduce((acc, curr) => {

      acc.protein += curr.protein;
      acc.fat += curr.fat;
      acc.carbo += curr.carbo;
      acc.fiber += curr.fiber;
      acc.calorie += curr.calorie;
      return acc;
      // }, []);
    }, { protein: 0, fat: 0, carbo: 0, fiber: 0, calorie: 0 });


    // Definir metas padrão baseadas no peso (você pode ajustar essas fórmulas)
    const goals = {
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
