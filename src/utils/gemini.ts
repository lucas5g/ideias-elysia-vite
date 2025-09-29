import { GoogleGenAI, File as File_2, createPartFromUri, createUserContent } from '@google/genai';
import { env } from './env';
import { Type } from '@prisma/client';
export const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });


export abstract class Gemini {

  static async createHistory(phrases: string[], tag?: string) {

    if (tag === '01') {
      return 'My name is Tom. I am a boy. I like food. I eat cheese. I drink soda. It is yummy. I play with my dog. Then I eat cheese. I drink soda. It is a good day.';
    }


    const prompt = `
      Create a short story at beginner level English with the following sentences.
      "${phrases.join(', ')}"  
      Return only the text
    `;

    return this.generateContent(prompt);
  }

  static async translate(text: string, language: 'english' | 'portuguese' = 'english') {
    const prompt = `Translate the following text "${text}", to ${language}, and return only the text.`;

    return this.generateContent(prompt);
  }

  static async transcribe(data: { file: File, type: Type }) {
    const file = await ai.files.upload({
      file: data.file,
      config: {
        mimeType: 'audio/ogg',
      }
    });

    const prompt = `Transcribe the audio into ${data.type} form`;

    return this.generateContent(prompt, file);
  }

  private static async generateContent(prompt: string, file?: File_2) {
    const contents = file
      ? createUserContent([
        createPartFromUri(file.uri!, file.mimeType!),
        prompt
      ])
      : prompt;

    console.log('contents', contents);


    const res = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        temperature: 0,
      },
    });

    console.log('res', res);

    return res.text ?? 'no translation';
  }
}


