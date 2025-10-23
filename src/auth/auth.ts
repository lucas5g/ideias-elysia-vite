import { env } from '@/utils/env';
import { prisma } from '@/utils/prisma';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { openAPI } from 'better-auth/plugins';

export const auth = betterAuth({
  basePath:'/api',
  advanced:{
    
    database:{
      useNumberId: true,
    }
  },


  database: prismaAdapter(prisma, {
    provider: 'sqlite',
  }),
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  plugins: [
    openAPI()
  ],
  
  trustedOrigins:['http://localhost:5173'],
});

