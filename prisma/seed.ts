import { elevenLabs } from '@/utils/eleven-labs'
import { prisma } from '@/utils/prisma'
import axios from 'axios'
async function main() {
  
  await prisma.user.upsert({
    where: {
      id: 1,
    },
    update: {},
    create: {
      weight: 79.05,
      calorie: 1650
    },
  })


  const foods = await prisma.food.count()

  if (!foods) {
    const { data } = await axios('https://n8n.dizelequefez.com.br/webhook/foods')

    const foodsList = data.slice(0, 5).map((food: any) => ({
      name: food.name,
      protein: food.protein,
      fat: food.fat,
      carbo: food.carbo,
      fiber: food.fiber,
      calorie: food.calorie,
    }))

    await prisma.food.createMany({
      data: foodsList
    })
  }


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