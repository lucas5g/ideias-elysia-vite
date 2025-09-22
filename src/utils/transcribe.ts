
import { gemini } from '@/utils/gemini';
import { Type } from '@prisma/client';


interface TrascribeInterface {
  file: File;
  type: Omit<Type, 'TRANSLATE'>;
}

export async function transcribe({ file, type }: TrascribeInterface) {

  const fileContent = await file.text();

  const prompt = `Transcreva o seguinte conteúdo "${fileContent}", e altere para "${type}", e retorne apenas o texto.`;


  const response = await gemini.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      temperature: 0,
    },
  });


  return response.text ?? 'no translation';
}
