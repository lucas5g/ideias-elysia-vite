import { prisma } from '@/utils/prisma'
import { GameModel } from "@/game/game.model"

export class GameService {
  findAll(where?: GameModel.findAllQuery) {
    return prisma.game.findMany({
      where,
    })
  }

  findOne(id: number) {
    return prisma.game.findUniqueOrThrow({ where: { id } })
  }

  create(data: GameModel.createBody) {
    return prisma.game.create({ data })
  }

  update(id: number, data: GameModel.updateBody) {
    return prisma.game.update({ where: { id }, data })
  }

  delete(id: number) {
    return prisma.game.delete({ where: { id } })
  }
}
