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

  static create(data: DietModel.createBody) {
    return prisma.diet.create({ data });
  }

  static update(id: number, data: DietModel.updateBody) {
    return prisma.diet.update({ where: { id }, data });
  }

  static delete(id: number) {
    return prisma.diet.delete({ where: { id } });
  }
}
