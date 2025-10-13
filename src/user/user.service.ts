import { prisma } from '@/utils/prisma';
import { UserModel } from '@/user/user.model';

export abstract class UserService {
  static findAll(where?: UserModel.findAllQuery) {
    return prisma.user.findMany({
      where,
    });
  }

  static findOne(id: number) {
    return prisma.user.findUniqueOrThrow({ where: { id } });
  }

  static create(data: UserModel.createBody) {
    return prisma.user.create({ data });
  }

  static update(id: number, data: UserModel.updateBody) {
    return prisma.user.update({ where: { id }, data });
  }

  static delete(id: number) {
    return prisma.user.delete({ where: { id } });
  }
}
