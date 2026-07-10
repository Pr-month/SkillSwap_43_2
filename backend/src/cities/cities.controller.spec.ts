import { Test, TestingModule } from '@nestjs/testing';
import { CitiesController } from './cities.controller';
import { CitiesService } from './cities.service';

describe('CitiesController', () => {
  let controller: CitiesController;

  const citiesServiceMock = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CitiesController],
      providers: [{ provide: CitiesService, useValue: citiesServiceMock }],
    }).compile();

    controller = module.get<CitiesController>(CitiesController);
  });

  it('delegates findAll to CitiesService', async () => {
    citiesServiceMock.findAll.mockResolvedValue([
      { id: 'city-1', name: 'Moscow' },
    ]);

    const result = await controller.findAll();

    expect(citiesServiceMock.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual([{ id: 'city-1', name: 'Moscow' }]);
  });

  it('delegates findOne with numeric id conversion', () => {
    citiesServiceMock.findOne.mockReturnValue('This action returns a #1 city');

    const result = controller.findOne('1');

    expect(citiesServiceMock.findOne).toHaveBeenCalledWith(1);
    expect(result).toBe('This action returns a #1 city');
  });

  it('delegates create with dto', async () => {
    const dto = { name: 'Kazan' };
    citiesServiceMock.create.mockResolvedValue({ id: 'city-2', name: 'Kazan' });

    const result = await controller.create(dto);

    expect(citiesServiceMock.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ id: 'city-2', name: 'Kazan' });
  });

  it('delegates update with id and dto', async () => {
    const dto = { name: 'Saint Petersburg' };
    citiesServiceMock.update.mockResolvedValue({
      id: 'city-3',
      name: 'Saint Petersburg',
    });

    const result = await controller.update('city-3', dto);

    expect(citiesServiceMock.update).toHaveBeenCalledWith('city-3', dto);
    expect(result).toEqual({ id: 'city-3', name: 'Saint Petersburg' });
  });

  it('delegates remove by id', async () => {
    citiesServiceMock.remove.mockResolvedValue(undefined);

    const result = await controller.remove('city-4');

    expect(citiesServiceMock.remove).toHaveBeenCalledWith('city-4');
    expect(result).toBeUndefined();
  });
});
