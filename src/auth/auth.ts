import { env } from '@/utils/env';
import { betterAuth } from 'better-auth';
export const auth = betterAuth({
  // database: prismaAdapter({
  //   prisma
  // }),
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
});