// import { env } from '@/utils/env';
// import { prisma } from '@/utils/prisma';
// import { betterAuth } from 'better-auth';
// import { prismaAdapter } from 'better-auth/adapters/prisma'; 
// export const auth = betterAuth({

//   database: prismaAdapter(prisma, {
//     provider: 'sqlite',
//   }),
//   socialProviders: {
//     google: {
//       clientId: env.GOOGLE_CLIENT_ID,
//       clientSecret: env.GOOGLE_CLIENT_SECRET,
//     },
//   },
//   basePath:'/api'
// });