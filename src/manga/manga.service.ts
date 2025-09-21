import axios from "axios";
import * as cheerio from 'cheerio';
import fs from 'fs/promises'
import { execSync } from "child_process";

export abstract class MangaService {


  static build() {
    //create folders 
    //download images
    //generate epub
  }

  static async createFolders(folder: string) {


    if (!await fs.exists('./images')) {
      await fs.mkdir('./images');
    }

    if (!await fs.exists(`./images/${folder}`)) {
      await fs.mkdir(`./images/${folder}`);
    }

    return folder
  }

  static async downloadImages(url: string, folder: string) {

    const { data } = await axios.get(url);

    const $ = cheerio.load(data);

    const images = $('img').map((_, el) => $(el).attr('src')).get();


    images.forEach(async (img, index) => {

      const pathImage = `./images/${folder}/${(index + 1).toString().padStart(2, '0')}.jpg`

      if (await fs.exists(pathImage)) {
        return
      }

      const { data } = await axios.get(img, { responseType: 'arraybuffer' });

      await fs.writeFile(pathImage, data);
    })
  }

  static async generateEpub(folder: string) {
    const coverImage = `./images/${folder}/01.jpg`; // Caminho para a imagem da capa
    const pdfFile = `./images/${folder}/${folder}.pdf`;
    const epubFile = `./images/${folder}/${folder}.epub`;

    const command = `
      img2pdf ./images/${folder}/*.jpg -o ${pdfFile} && \
      ebook-convert ${pdfFile} ${epubFile} --cover ${coverImage}
    `;

    execSync(command);
    console.log(`EPUB gerado com capa: ${epubFile}`);
  }

  static async test(url: string) {

    const folder = url.split('/').pop();

    // return




  }

}