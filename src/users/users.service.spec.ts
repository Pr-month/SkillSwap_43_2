import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { appConfig } from 'src/config/app.config';
import { CategoriesService } from '../categories/categories.service';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;

  const usersRepositoryMock = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const categoriesServiceMock = {
    findByIds: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: usersRepositoryMock,
        },
        {
          provide: appConfig.KEY,
          useValue: { hashSalt: 10 },
        },
        {
          provide: CategoriesService,
          useValue: categoriesServiceMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('creates user with categories from wantToLearn', async () => {
      const createdUser = { id: 'user-1', email: 'john@test.dev' } as User;
      const categories = [{ id: 'cat-1' }, { id: 'cat-2' }];
      usersRepositoryMock.create.mockReturnValue(createdUser);
      categoriesServiceMock.findByIds.mockResolvedValue(categories);
      usersRepositoryMock.save.mockResolvedValue({ ...createdUser, wantToLearn: categories });

      const result = await service.create({
        email: 'john@test.dev',
        wantToLearn: ['cat-1', 'cat-2'],
      } as any);

      expect(usersRepositoryMock.create).toHaveBeenCalledWith({
        email: 'john@test.dev',
      });
      expect(categoriesServiceMock.findByIds).toHaveBeenCalledWith(['cat-1', 'cat-2']);
      expect(usersRepositoryMock.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'user-1',
          wantToLearn: categories,
        }),
      );
      expect(result).toEqual({ ...createdUser, wantToLearn: categories });
    });

    it('creates user without categories when wantToLearn is empty', async () => {
      const createdUser = { id: 'user-2', email: 'empty@test.dev' } as User;
      usersRepositoryMock.create.mockReturnValue(createdUser);
      usersRepositoryMock.save.mockResolvedValue(createdUser);

      const result = await service.create({
        email: 'empty@test.dev',
        wantToLearn: [],
      } as any);

      expect(categoriesServiceMock.findByIds).not.toHaveBeenCalled();
      expect(usersRepositoryMock.save).toHaveBeenCalledWith(createdUser);
      expect(result).toEqual(createdUser);
    });
  });

  it('returns all users in findAll', async () => {
    const users = [{ id: '1' }, { id: '2' }];
    usersRepositoryMock.find.mockResolvedValue(users);

    const result = await service.findAll();

    expect(usersRepositoryMock.find).toHaveBeenCalledTimes(1);
    expect(result).toEqual(users);
  });

  describe('findById', () => {
    it('returns user when found', async () => {
      const user = { id: 'user-3' };
      usersRepositoryMock.findOne.mockResolvedValue(user);

      const result = await service.findById('user-3');

      expect(usersRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: 'user-3' },
      });
      expect(result).toEqual(user);
    });

    it('throws NotFoundException when user does not exist', async () => {
      usersRepositoryMock.findOne.mockResolvedValue(null);

      await expect(service.findById('missing-user')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  it('findByEmail delegates to repository', async () => {
    const user = { id: 'user-email', email: 'mail@test.dev' };
    usersRepositoryMock.findOne.mockResolvedValue(user);

    const result = await service.findByEmail('mail@test.dev');

    expect(usersRepositoryMock.findOne).toHaveBeenCalledWith({
      where: { email: 'mail@test.dev' },
    });
    expect(result).toEqual(user);
  });

  describe('update', () => {
    it('updates user and maps wantToLearn ids to categories', async () => {
      const existingUser = { id: 'user-4', name: 'Old Name' } as User;
      const categories = [{ id: 'cat-1' }];
      usersRepositoryMock.findOne.mockResolvedValue(existingUser);
      categoriesServiceMock.findByIds.mockResolvedValue(categories);
      usersRepositoryMock.save.mockResolvedValue({
        ...existingUser,
        name: 'New Name',
        wantToLearn: categories,
      });

      const result = await service.update('user-4', {
        name: 'New Name',
        wantToLearn: ['cat-1'],
      });

      expect(categoriesServiceMock.findByIds).toHaveBeenCalledWith(['cat-1']);
      expect(usersRepositoryMock.save).toHaveBeenCalledWith({
        ...existingUser,
        name: 'New Name',
        wantToLearn: categories,
      });
      expect(result).toEqual({
        ...existingUser,
        name: 'New Name',
        wantToLearn: categories,
      });
    });

    it('throws NotFoundException when trying to update missing user', async () => {
      usersRepositoryMock.findOne.mockResolvedValue(null);

      await expect(service.update('missing', { name: 'Name' })).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  it('saveRefreshToken updates repository token field', async () => {
    usersRepositoryMock.update.mockResolvedValue(undefined);

    await service.saveRefreshToken('user-5', 'refresh-token');

    expect(usersRepositoryMock.update).toHaveBeenCalledWith(
      { id: 'user-5' },
      { refreshToken: 'refresh-token' },
    );
  });

  it('clearRefreshToken sets token to null', async () => {
    usersRepositoryMock.update.mockResolvedValue(undefined);

    await service.clearRefreshToken('user-6');

    expect(usersRepositoryMock.update).toHaveBeenCalledWith(
      { id: 'user-6' },
      { refreshToken: null },
    );
  });

  describe('updatePassword', () => {
    const dto = {
      oldPassword: 'old-password',
      newPassword: 'new-password',
    };

    const queryBuilderMock = {
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    };

    it('updates password when old password is correct', async () => {
      const user = { id: 'user-7', password: 'hashed-old' } as User;
      usersRepositoryMock.createQueryBuilder.mockReturnValue(queryBuilderMock);
      queryBuilderMock.getOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-new');
      usersRepositoryMock.save.mockResolvedValue(undefined);

      await service.updatePassword('user-7', dto);

      expect(usersRepositoryMock.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(queryBuilderMock.addSelect).toHaveBeenCalledWith('user.password');
      expect(queryBuilderMock.where).toHaveBeenCalledWith('user.id = :id', {
        id: 'user-7',
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('old-password', 'hashed-old');
      expect(bcrypt.hash).toHaveBeenCalledWith('new-password', 10);
      expect(usersRepositoryMock.save).toHaveBeenCalledWith({
        id: 'user-7',
        password: 'hashed-new',
      });
    });

    it('throws NotFoundException when user is missing', async () => {
      usersRepositoryMock.createQueryBuilder.mockReturnValue(queryBuilderMock);
      queryBuilderMock.getOne.mockResolvedValue(null);

      await expect(service.updatePassword('missing-user', dto)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('throws UnauthorizedException when old password does not match', async () => {
      const user = { id: 'user-8', password: 'hashed-old' } as User;
      usersRepositoryMock.createQueryBuilder.mockReturnValue(queryBuilderMock);
      queryBuilderMock.getOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.updatePassword('user-8', dto)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(usersRepositoryMock.save).not.toHaveBeenCalled();
    });
  });
});
