import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { appConfig } from 'src/config/app.config';
import { jwtConfig } from 'src/config/jwt.config';
import { UsersService } from 'src/users/users.service';
import { Role, TJwtPayload } from './auth.types';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

interface IUserData {
  id: string;
  email: string;
  password?: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
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
    const user = (await this.usersService.findByEmail(
      dto.email,
    )) as IUserData | null;
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
      role: user.role as Role,
    };

    return this.generateTokens(payload);
  }

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(
      dto.password,
      Number(this.appConfiguration.hashSalt),
    );

    const user = (await this.usersService.create({
      ...dto,
      password: hashedPassword,
    })) as IUserData;

    const payload: TJwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role as Role,
    };

    return this.generateTokens(payload);
  }

  async logout(userId: string) {
    await this.usersService.findById(userId);
    return { message: 'Logged out successfully' };
  }

  async refresh(payload: TJwtPayload) {
    const user = (await this.usersService.findByEmail(
      payload.email,
    )) as IUserData | null;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const newPayload: TJwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role as Role,
    };

    return this.generateTokens(newPayload);
  }
}
