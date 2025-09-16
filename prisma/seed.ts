import { elevenLabs } from '@/utils/eleven-labs'
import { prisma } from '@/utils/prisma'
async function main(){
  await prisma.phrase.createMany({
    data: [
      {
        portuguese: 'ola',
        english: 'hello',
        tags: ['test', 't1'],
        audio: await elevenLabs('hello')
      },
      {
        portuguese: 'bom dia',
        english: 'good morning',
        tags: ['test'],
        audio: await elevenLabs('good morning')
      }
    ]
  })
}

main()