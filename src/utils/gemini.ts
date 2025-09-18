import { GoogleGenAI } from '@google/genai';
import { env } from './env';

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

export async function gemini(text: string) {

  if (text === 'teste') {
    return 'test';
  }

  const prompt = `
    Traduza a frase "${text}", de português para inglês, e retorne apenas o texto.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-lite',
    contents: prompt,
    config: {
      temperature: 0,
    },
  });

  return response.text ?? 'no translation';
}
