import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  port: Number(process.env.APP_PORT ?? 3000),
  hashSalt: Number(process.env.HASH_SALT ?? 10),
}));

export type AppConfig = ReturnType<typeof appConfig>;
