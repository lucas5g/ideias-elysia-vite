import axios from "axios";
import * as cheerio from 'cheerio';


export abstract class MangaService {

  static async test(url: string) {

    const { data } = await axios.get(url);

    const $ = cheerio.load(data);

    const images = $('img').map((_, el) => $(el).attr('src')).get();

    console.log(images);

    console.log($)

    // console.log(data);
    // return url;
  }

}