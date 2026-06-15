import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { In, IsNull } from 'typeorm';
import { Category } from './entities/category.entity';
import { CategoriesService } from './categories.service';

describe('CategoriesService', () => {
  let service: CategoriesService;

  const categoriesRepositoryMock = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: categoriesRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('findAll returns only root categories with children relation', async () => {
    const categories = [{ id: 'cat-1' }, { id: 'cat-2' }];
    categoriesRepositoryMock.find.mockResolvedValue(categories);

    const result = await service.findAll();

    expect(categoriesRepositoryMock.find).toHaveBeenCalledWith({
      where: { parent: IsNull() },
      relations: { children: true },
    });
    expect(result).toEqual(categories);
  });

  it('findByIds delegates to repository with In operator', async () => {
    const categories = [{ id: 'cat-1' }];
    categoriesRepositoryMock.find.mockResolvedValue(categories);

    const result = await service.findByIds(['cat-1']);

    expect(categoriesRepositoryMock.find).toHaveBeenCalledWith({
      where: { id: In(['cat-1']) },
    });
    expect(result).toEqual(categories);
  });

  describe('create', () => {
    it('creates category without parent', async () => {
      const createdCategory = { name: 'Backend' } as Category;
      categoriesRepositoryMock.create.mockReturnValue(createdCategory);
      categoriesRepositoryMock.save.mockResolvedValue({
        id: 'cat-1',
        name: 'Backend',
      });

      const result = await service.create({ name: 'Backend' });

      expect(categoriesRepositoryMock.create).toHaveBeenCalledWith({ name: 'Backend' });
      expect(categoriesRepositoryMock.findOne).not.toHaveBeenCalled();
      expect(categoriesRepositoryMock.save).toHaveBeenCalledWith(createdCategory);
      expect(result).toEqual({ id: 'cat-1', name: 'Backend' });
    });

    it('creates category with parent when parent exists', async () => {
      const parent = { id: 'parent-1', name: 'Programming' } as Category;
      const createdCategory = { name: 'Node.js' } as Category;
      categoriesRepositoryMock.create.mockReturnValue(createdCategory);
      categoriesRepositoryMock.findOne.mockResolvedValue(parent);
      categoriesRepositoryMock.save.mockResolvedValue({
        id: 'cat-2',
        name: 'Node.js',
        parent,
      });

      const result = await service.create({ name: 'Node.js', parentId: 'parent-1' });

      expect(categoriesRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: 'parent-1' },
      });
      expect(categoriesRepositoryMock.save).toHaveBeenCalledWith({
        name: 'Node.js',
        parent,
      });
      expect(result).toEqual({ id: 'cat-2', name: 'Node.js', parent });
    });

    it('throws NotFoundException when parentId is invalid', async () => {
      categoriesRepositoryMock.create.mockReturnValue({ name: 'Node.js' } as Category);
      categoriesRepositoryMock.findOne.mockResolvedValue(null);

      await expect(
        service.create({ name: 'Node.js', parentId: 'missing-parent' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('update', () => {
    it('updates category name and parent', async () => {
      const category = { id: 'cat-3', name: 'Old Name' } as Category;
      const parent = { id: 'parent-2', name: 'Web' } as Category;
      categoriesRepositoryMock.findOne
        .mockResolvedValueOnce(category)
        .mockResolvedValueOnce(parent);
      categoriesRepositoryMock.save.mockResolvedValue({
        id: 'cat-3',
        name: 'New Name',
        parent,
      });

      const result = await service.update('cat-3', {
        name: 'New Name',
        parentId: 'parent-2',
      });

      expect(categoriesRepositoryMock.findOne).toHaveBeenNthCalledWith(1, {
        where: { id: 'cat-3' },
      });
      expect(categoriesRepositoryMock.findOne).toHaveBeenNthCalledWith(2, {
        where: { id: 'parent-2' },
      });
      expect(categoriesRepositoryMock.save).toHaveBeenCalledWith({
        id: 'cat-3',
        name: 'New Name',
        parent,
      });
      expect(result).toEqual({ id: 'cat-3', name: 'New Name', parent });
    });

    it('throws NotFoundException when category does not exist', async () => {
      categoriesRepositoryMock.findOne.mockResolvedValue(null);

      await expect(service.update('missing-category', { name: 'Any' })).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('throws NotFoundException when parent is not found', async () => {
      const category = { id: 'cat-4', name: 'DevOps' } as Category;
      categoriesRepositoryMock.findOne
        .mockResolvedValueOnce(category)
        .mockResolvedValueOnce(null);

      await expect(
        service.update('cat-4', { parentId: 'missing-parent' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('remove', () => {
    it('removes category when it exists', async () => {
      const category = { id: 'cat-5', name: 'Design' } as Category;
      categoriesRepositoryMock.findOne.mockResolvedValue(category);
      categoriesRepositoryMock.remove.mockResolvedValue(undefined);

      await service.remove('cat-5');

      expect(categoriesRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: 'cat-5' },
      });
      expect(categoriesRepositoryMock.remove).toHaveBeenCalledWith(category);
    });

    it('throws NotFoundException when category is missing', async () => {
      categoriesRepositoryMock.findOne.mockResolvedValue(null);

      await expect(service.remove('missing-category')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
