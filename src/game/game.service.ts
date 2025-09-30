import { prisma } from '@/utils/prisma';
import { GameModel } from '@/game/game.model';

export abstract class GameService {
  static findAll(where?: GameModel.findAllQuery) {
    return prisma.game.findMany({
      where,
    });
  }

  static findOne(id: number) {
    return prisma.game.findUniqueOrThrow({ where: { id } });
  }

  static create(data: GameModel.createBody) {
    return prisma.game.create({ data });
  }

  static update(id: number, data: GameModel.updateBody) {
    return prisma.game.update({ where: { id }, data });
  }

  static delete(id: number) {
    return prisma.game.delete({ where: { id } });
  }
}
