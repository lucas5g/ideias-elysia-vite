import { MangaService } from "@/manga/manga.service";
import { describe, expect, it } from "bun:test";
import fs from 'fs/promises'
describe("MangaService", () => {

  const url = 'https://kaijuno8chapters.com/manga/kaiju-no-8-chapter-13'
  const folder = url.split('/').pop();

  it('createFolders', async () => {
    const res = await MangaService.createFolders(folder!)

    expect(res).toBe(folder!)

  })

  it('downloadImages', async () => {
    await MangaService.downloadImages(url, folder!)

    const images = await fs.readdir(`./images/${folder}`)

    expect(images.length).toEqual(20)

  }, 6400)


  it('generateEpub', async () => {
    await MangaService.generateEpub(folder!)
  })


})