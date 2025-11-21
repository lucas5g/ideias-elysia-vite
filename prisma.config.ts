import { defineConfig } from 'prisma/config'
import 'dotenv/config'
export default defineConfig({
  migrations: {
    seed: "bun prisma/seed.ts"
  },
  // datasource: {
  //   url: env('DATABASE_URL')
  // },
  // adapter:() => ({
  //   type: 'postgresql',
  //   url: process.env.DATABASE_URL || '',
  // }),
})