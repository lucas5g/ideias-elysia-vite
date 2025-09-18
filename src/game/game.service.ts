import { prisma } from '@/utils/prisma';
import { CreateGameDto, UpdateGameDto, FindAllGameDto } from '@/game/game.model';

export class GameService {
  findAll(where?: FindAllGameDto) {
    return prisma.game.findMany({
      where,
    });
  }

  findOne(id: number) {
    return prisma.game.findUnique({ where: { id } });
  }

  create(data: CreateGameDto) {
    return prisma.game.create({ data });
  }

  update(id: number, data: UpdateGameDto) {
    return prisma.game.update({ where: { id }, data });
  }

  delete(id: number) {
    return prisma.game.delete({ where: { id } });
  }
}
