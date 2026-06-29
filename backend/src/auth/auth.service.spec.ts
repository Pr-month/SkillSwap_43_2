import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { appConfig } from 'src/config/app.config';
import { jwtConfig } from 'src/config/jwt.config';
import { Gender, Roles } from 'src/users/users.enums';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;

  const usersServiceMock = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    saveRefreshToken: jest.fn(),
    clearRefreshToken: jest.fn(),
  };

  const jwtServiceMock = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
        {
          provide: appConfig.KEY,
          useValue: { hashSalt: 10 },
        },
        {
          provide: jwtConfig.KEY,
          useValue: {
            secret: 'access-secret',
            refreshSecret: 'refresh-secret',
            expiresIn: '1h',
            refreshExpiresIn: '7d',
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('returns tokens for valid credentials', async () => {
      usersServiceMock.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'user@test.dev',
        role: Roles.USER,
        password: 'hashed-password',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtServiceMock.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await service.login({
        email: 'user@test.dev',
        password: 'plain-password',
      });

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
      expect(jwtServiceMock.signAsync).toHaveBeenNthCalledWith(
        1,
        { sub: 'user-1', email: 'user@test.dev', role: Roles.USER },
        { secret: 'access-secret', expiresIn: '1h' },
      );
      expect(jwtServiceMock.signAsync).toHaveBeenNthCalledWith(
        2,
        { sub: 'user-1', email: 'user@test.dev', role: Roles.USER },
        { secret: 'refresh-secret', expiresIn: '7d' },
      );
      expect(usersServiceMock.saveRefreshToken).toHaveBeenCalledWith(
        'user-1',
        'refresh-token',
      );
    });

    it('throws UnauthorizedException when user is missing', async () => {
      usersServiceMock.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'missing@test.dev',
          password: 'plain-password',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws UnauthorizedException when password is missing', async () => {
      usersServiceMock.findByEmail.mockResolvedValue({
        id: 'user-2',
        email: 'no-password@test.dev',
        role: Roles.USER,
        password: null,
      });

      await expect(
        service.login({
          email: 'no-password@test.dev',
          password: 'plain-password',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws UnauthorizedException when password does not match', async () => {
      usersServiceMock.findByEmail.mockResolvedValue({
        id: 'user-3',
        email: 'wrong@test.dev',
        role: Roles.USER,
        password: 'hashed-password',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({
          email: 'wrong@test.dev',
          password: 'plain-password',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('creates user, stores refresh token and returns tokens', async () => {
      usersServiceMock.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      usersServiceMock.create.mockResolvedValue({
        id: 'new-user-1',
        email: 'new@test.dev',
        role: Roles.USER,
      });
      jwtServiceMock.signAsync
        .mockResolvedValueOnce('new-access-token')
        .mockResolvedValueOnce('new-refresh-token');

      const result = await service.register({
        name: 'Test User',
        email: 'new@test.dev',
        password: 'plain-password',
        wantToLearn: ['cat-1'],
        birthdate: '2000-01-01',
        about: 'About text',
        gender: Gender.MALE,
        avatar: 'avatar.png',
      });

      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
      expect(usersServiceMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'new@test.dev',
          password: 'hashed-password',
          wantToLearn: [],
        }),
      );
      expect(usersServiceMock.saveRefreshToken).toHaveBeenCalledWith(
        'new-user-1',
        'new-refresh-token',
      );
    });

    it('throws ConflictException when email already exists', async () => {
      usersServiceMock.findByEmail.mockResolvedValue({
        id: 'existing-user',
      });

      await expect(
        service.register({
          name: 'Test User',
          email: 'existing@test.dev',
          password: 'plain-password',
          wantToLearn: ['cat-1'],
          birthdate: '2000-01-01',
          about: 'About text',
          gender: Gender.MALE,
          avatar: 'avatar.png',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('logout', () => {
    it('clears refresh token and returns message', async () => {
      usersServiceMock.clearRefreshToken.mockResolvedValue(undefined);

      const result = await service.logout('user-logout');

      expect(usersServiceMock.clearRefreshToken).toHaveBeenCalledWith(
        'user-logout',
      );
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });

  describe('refresh', () => {
    it('returns new tokens and stores new refresh token', async () => {
      usersServiceMock.findById.mockResolvedValue({
        id: 'user-refresh',
        email: 'refresh@test.dev',
        role: Roles.ADMIN,
        refreshToken: 'stored-refresh-token',
      });
      jwtServiceMock.signAsync
        .mockResolvedValueOnce('refreshed-access-token')
        .mockResolvedValueOnce('refreshed-refresh-token');

      const result = await service.refresh(
        { sub: 'user-refresh', email: 'refresh@test.dev', role: Roles.ADMIN },
        'stored-refresh-token',
      );

      expect(result).toEqual({
        accessToken: 'refreshed-access-token',
        refreshToken: 'refreshed-refresh-token',
      });
      expect(usersServiceMock.saveRefreshToken).toHaveBeenCalledWith(
        'user-refresh',
        'refreshed-refresh-token',
      );
    });

    it('throws UnauthorizedException when stored token is missing', async () => {
      usersServiceMock.findById.mockResolvedValue({
        id: 'user-no-token',
        email: 'refresh@test.dev',
        role: Roles.USER,
        refreshToken: null,
      });

      await expect(
        service.refresh(
          { sub: 'user-no-token', email: 'refresh@test.dev', role: Roles.USER },
          'incoming-refresh-token',
        ),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws UnauthorizedException when token does not match', async () => {
      usersServiceMock.findById.mockResolvedValue({
        id: 'user-wrong-token',
        email: 'refresh@test.dev',
        role: Roles.USER,
        refreshToken: 'stored-refresh-token',
      });

      await expect(
        service.refresh(
          {
            sub: 'user-wrong-token',
            email: 'refresh@test.dev',
            role: Roles.USER,
          },
          'incoming-refresh-token',
        ),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});
