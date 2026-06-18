import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

describe('CategoriesController', () => {
  let controller: CategoriesController;

  const categoriesServiceMock = {
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [{ provide: CategoriesService, useValue: categoriesServiceMock }],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
  });

  it('delegates findAll to CategoriesService', async () => {
    categoriesServiceMock.findAll.mockResolvedValue([{ id: 'cat-1' }]);

    const result = await controller.findAll();

    expect(categoriesServiceMock.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual([{ id: 'cat-1' }]);
  });

  it('delegates create with dto', async () => {
    const dto = { name: 'Backend', parentId: 'parent-1' };
    categoriesServiceMock.create.mockResolvedValue({ id: 'cat-2', name: 'Backend' });

    const result = await controller.create(dto);

    expect(categoriesServiceMock.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ id: 'cat-2', name: 'Backend' });
  });

  it('delegates update with id and dto', async () => {
    const dto = { name: 'Updated Name' };
    categoriesServiceMock.update.mockResolvedValue({ id: 'cat-3', name: 'Updated Name' });

    const result = await controller.update('cat-3', dto);

    expect(categoriesServiceMock.update).toHaveBeenCalledWith('cat-3', dto);
    expect(result).toEqual({ id: 'cat-3', name: 'Updated Name' });
  });

  it('delegates remove by id', async () => {
    categoriesServiceMock.remove.mockResolvedValue(undefined);

    const result = await controller.remove('cat-4');

    expect(categoriesServiceMock.remove).toHaveBeenCalledWith('cat-4');
    expect(result).toBeUndefined();
  });
});
