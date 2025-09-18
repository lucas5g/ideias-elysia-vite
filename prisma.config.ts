import { defineConfig } from 'prisma/config'
import 'dotenv/config'
export default defineConfig({
  migrations: {
    seed: "bun prisma/seed.ts"
  },
  
})