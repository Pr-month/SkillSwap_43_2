import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AppConfig, appConfig } from 'src/config/app.config';
import { JwtConfig, jwtConfig } from 'src/config/jwt.config';
import { Roles } from 'src/users/users.enums';
import { UsersService } from 'src/users/users.service';
import { TJwtPayload } from './auth.types';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @Inject(appConfig.KEY)
    private readonly appConfiguration: AppConfig,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: JwtConfig,
  ) {}

  private async generateTokens(payload: TJwtPayload) {
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.jwtConfiguration.secret,
      expiresIn: this.jwtConfiguration.expiresIn as unknown as number,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.jwtConfiguration.refreshSecret,
      expiresIn: this.jwtConfiguration.refreshExpiresIn as unknown as number,
    });

    return { accessToken, refreshToken };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: TJwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const tokens = await this.generateTokens(payload);
    await this.usersService.saveRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(
      dto.password,
      this.appConfiguration.hashSalt,
    );

    const user = await this.usersService.create({
      ...dto,
      password: hashedPassword,
    });

    const payload: TJwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const tokens = await this.generateTokens(payload);
    await this.usersService.saveRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string) {
    await this.usersService.clearRefreshToken(userId);
    return { message: 'Logged out successfully' };
  }

  async refresh(payload: TJwtPayload, refreshToken: string) {
    const user = await this.usersService.findById(payload.sub);
    if (!user.refreshToken || user.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const newPayload: TJwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const tokens = await this.generateTokens(newPayload);
    await this.usersService.saveRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }
}
