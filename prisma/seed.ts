import { elevenLabs } from '@/utils/eleven-labs'
import { prisma } from '@/utils/prisma'
async function main() {

  const phrases = await prisma.phrase.count()

  if (!phrases) {

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

  const games = await prisma.game.count()

  if (games) {
    return
  }


  await prisma.game.createMany({
    data: [
      {
        name: 'Test name',
        description: 'Test description',
        category: 'Test category',
      },
      {
        name: 'Test name 2',
        description: 'Test description 2',
        category: 'Test category 2',
      }
    ]
  })
}

main()