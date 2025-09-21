import { MangaService } from "@/manga/manga.service";
import { describe, it } from "bun:test";

describe("MangaService", () => {

  it('test', async () => {
    const url = 'https://kaijuno8chapters.com/manga/kaiju-no-8-chapter-11/'

    const res = await MangaService.test(url)

    // console.log(res)

  }, 6000)
})