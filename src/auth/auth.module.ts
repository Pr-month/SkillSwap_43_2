import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { appConfig } from 'src/config/app.config';
import { jwtConfig } from 'src/config/jwt.config';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshJwtAuthGuard } from './guards/refresh-jwt-auth.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshJwtStrategy } from './strategies/refresh-jwt.strategy';
import { JwtSocketGuard } from './guards/ws-jwt.guard';

@Module({
  imports: [
    ConfigModule.forFeature(appConfig),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.register({}),
    UsersModule,
    PassportModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RefreshJwtStrategy,
    JwtAuthGuard,
    RefreshJwtAuthGuard,
    JwtSocketGuard,
  ],
  exports: [JwtModule],
})
export class AuthModule {}
