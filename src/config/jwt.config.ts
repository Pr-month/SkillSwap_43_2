import { registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET ?? 'secret',
  refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'refresh-secret',
  expiresIn: process.env.JWT_TOKEN_TIME ?? '1h',
  refreshExpiresIn: process.env.JWT_REFRESH_TOKEN_TIME ?? '7d',
}));

export type JwtConfig = ReturnType<typeof jwtConfig>;
