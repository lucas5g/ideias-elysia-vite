import { describe, it, beforeAll, afterAll, expect } from 'bun:test';
import { VideoService } from '@/video/video.service';

describe('VideoService', () => {
  let id: number;

  beforeAll(async () => {
    const payload = {
      title: 'Test title',
  url: 'Test url',
  currentTime: 123,
  pauseMinutes: 123,
  lastPlayed: new Date(),
    };
    const created = await VideoService.create(payload);
    id = created.id;
  });

  afterAll(async () => {
    await VideoService.delete(id);
  });

  it('findAll', async () => {
    const res = await VideoService.findAll();
    expect(res).toBeArray();
  });

  it('findOne', async () => {
    const record = await VideoService.findOne(id);
    expect(record).toHaveProperty('id', id);
  });

  it('update', async () => {
    const payload = {
      title: 'Updated title',
    };
    const res = await VideoService.update(id, payload);
    expect(res).toMatchObject(payload);
  });
});
