import { Test, TestingModule } from '@nestjs/testing';
import { Gender } from './users.enums';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  const usersServiceMock = {
    findById: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    updatePassword: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersServiceMock }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('delegates getMe with id from request', async () => {
    usersServiceMock.findById.mockResolvedValue({ id: 'me-user' });
    const req = { user: { sub: 'me-user' } } as any;

    const result = await controller.getMe(req);

    expect(usersServiceMock.findById).toHaveBeenCalledWith('me-user');
    expect(result).toEqual({ id: 'me-user' });
  });

  it('delegates findAll', async () => {
    usersServiceMock.findAll.mockResolvedValue([{ id: '1' }, { id: '2' }]);

    const result = await controller.findAll();

    expect(usersServiceMock.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual([{ id: '1' }, { id: '2' }]);
  });

  it('delegates findOne by id', async () => {
    usersServiceMock.findById.mockResolvedValue({ id: 'user-1' });

    const result = await controller.findOne('user-1');

    expect(usersServiceMock.findById).toHaveBeenCalledWith('user-1');
    expect(result).toEqual({ id: 'user-1' });
  });

  it('delegates update with authenticated user id', async () => {
    const req = { user: { sub: 'user-2' } } as any;
    const dto = {
      name: 'Updated Name',
      city: 'Moscow',
      gender: Gender.MALE,
    };
    usersServiceMock.update.mockResolvedValue({ id: 'user-2', ...dto });

    const result = await controller.update(req, dto);

    expect(usersServiceMock.update).toHaveBeenCalledWith('user-2', dto);
    expect(result).toEqual({ id: 'user-2', ...dto });
  });

  it('delegates updatePassword with authenticated user id', async () => {
    const req = { user: { sub: 'user-3' } } as any;
    const dto = { oldPassword: 'old-password', newPassword: 'new-password' };
    usersServiceMock.updatePassword.mockResolvedValue(undefined);

    const result = await controller.updatePassword(req, dto);

    expect(usersServiceMock.updatePassword).toHaveBeenCalledWith('user-3', dto);
    expect(result).toBeUndefined();
  });
});
