import { prisma } from '@/utils/prisma';
import { VideoModel } from '@/video/video.model';

export abstract class VideoService {
  static findAll(where?: VideoModel.findAllQuery) {
    return prisma.video.findMany({
      where,
    });
  }

  static findOne(id: number) {
    return prisma.video.findUniqueOrThrow({ where: { id } });
  }

  static create(data: VideoModel.createBody) {
    return prisma.video.create({ data });
  }

  static update(id: number, data: VideoModel.updateBody) {
    return prisma.video.update({ where: { id }, data });
  }

  static delete(id: number) {
    return prisma.video.delete({ where: { id } });
  }
}
