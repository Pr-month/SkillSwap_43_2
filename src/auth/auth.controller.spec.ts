import { Test, TestingModule } from '@nestjs/testing';
import { Gender, Roles } from 'src/users/users.enums';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const authServiceMock = {
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    refresh: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('delegates register to AuthService', async () => {
    const dto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      wantToLearn: ['cat-1'],
      birthdate: '2000-01-01',
      about: 'About text',
      gender: Gender.MALE,
      avatar: 'avatar.png',
    };
    authServiceMock.register.mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    const result = await controller.register(dto);

    expect(authServiceMock.register).toHaveBeenCalledWith(dto);
    expect(result).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
  });

  it('delegates login to AuthService', async () => {
    const dto = {
      email: 'test@example.com',
      password: 'password123',
    };
    authServiceMock.login.mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    const result = await controller.login(dto);

    expect(authServiceMock.login).toHaveBeenCalledWith(dto);
    expect(result).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
  });

  it('delegates logout with request user id', async () => {
    const req = {
      user: {
        sub: 'user-1',
        email: 'test@example.com',
        role: Roles.USER,
      },
    } as any;
    authServiceMock.logout.mockResolvedValue({
      message: 'Logged out successfully',
    });

    const result = await controller.logout(req);

    expect(authServiceMock.logout).toHaveBeenCalledWith('user-1');
    expect(result).toEqual({ message: 'Logged out successfully' });
  });

  it('delegates refresh with request user and token', async () => {
    const req = {
      user: {
        sub: 'user-2',
        email: 'refresh@example.com',
        role: Roles.ADMIN,
      },
    } as any;
    authServiceMock.refresh.mockResolvedValue({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });

    const result = await controller.refresh(req, 'incoming-refresh-token');

    expect(authServiceMock.refresh).toHaveBeenCalledWith(
      req.user,
      'incoming-refresh-token',
    );
    expect(result).toEqual({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });
  });
});
