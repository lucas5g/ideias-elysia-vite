import z from 'zod';

export const env = z
  .object({
    DATABASE_URL: z.string(),
    ELEVEN_LABS_API_KEY: z.string(),
    BASE_URL_API: z.string().default('http://localhost:3000'),
    GEMINI_API_KEY: z.string(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    // JWT_SECRET: z.string(),
    // BETTER_AUTH_SECRET: z.string(),
    // BETTER_AUTH_URL: z.string(),
  })
  .parse(process.env);

  