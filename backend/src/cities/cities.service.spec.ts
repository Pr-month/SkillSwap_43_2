import { ConflictException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { City } from './entities/city.entity';
import { CitiesService } from './cities.service';

describe('CitiesService', () => {
  let service: CitiesService;

  const citiesRepositoryMock = {
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
        CitiesService,
        {
          provide: getRepositoryToken(City),
          useValue: citiesRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<CitiesService>(CitiesService);
  });

  it('findAll returns cities with limit', async () => {
    const cities = [{ id: 'city-1', name: 'Moscow' }];
    citiesRepositoryMock.find.mockResolvedValue(cities);

    const result = await service.findAll();

    expect(citiesRepositoryMock.find).toHaveBeenCalledWith({ take: 10 });
    expect(result).toEqual(cities);
  });

  describe('create', () => {
    it('creates city when name is unique', async () => {
      const createdCity = { name: 'Kazan' } as City;
      citiesRepositoryMock.findOne.mockResolvedValue(null);
      citiesRepositoryMock.create.mockReturnValue(createdCity);
      citiesRepositoryMock.save.mockResolvedValue({
        id: 'city-1',
        name: 'Kazan',
      });

      const result = await service.create({ name: 'Kazan' });

      expect(citiesRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { name: 'Kazan' },
      });
      expect(citiesRepositoryMock.create).toHaveBeenCalledWith({
        name: 'Kazan',
      });
      expect(citiesRepositoryMock.save).toHaveBeenCalledWith(createdCity);
      expect(result).toEqual({ id: 'city-1', name: 'Kazan' });
    });

    it('throws ConflictException when city name already exists', async () => {
      citiesRepositoryMock.findOne.mockResolvedValue({
        id: 'city-1',
        name: 'Kazan',
      });

      await expect(service.create({ name: 'Kazan' })).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(citiesRepositoryMock.create).not.toHaveBeenCalled();
      expect(citiesRepositoryMock.save).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('updates city name when new name is unique', async () => {
      const city = { id: 'city-2', name: 'Moscow' } as City;
      citiesRepositoryMock.findOne
        .mockResolvedValueOnce(city)
        .mockResolvedValueOnce(null);
      citiesRepositoryMock.save.mockResolvedValue({
        id: 'city-2',
        name: 'Saint Petersburg',
      });

      const result = await service.update('city-2', {
        name: 'Saint Petersburg',
      });

      expect(citiesRepositoryMock.findOne).toHaveBeenNthCalledWith(1, {
        where: { id: 'city-2' },
      });
      expect(citiesRepositoryMock.findOne).toHaveBeenNthCalledWith(2, {
        where: { name: 'Saint Petersburg' },
      });
      expect(citiesRepositoryMock.save).toHaveBeenCalledWith({
        id: 'city-2',
        name: 'Saint Petersburg',
      });
      expect(result).toEqual({ id: 'city-2', name: 'Saint Petersburg' });
    });

    it('returns city unchanged when name is not provided', async () => {
      const city = { id: 'city-3', name: 'Kazan' } as City;
      citiesRepositoryMock.findOne.mockResolvedValue(city);
      citiesRepositoryMock.save.mockResolvedValue(city);

      const result = await service.update('city-3', {});

      expect(citiesRepositoryMock.findOne).toHaveBeenCalledTimes(1);
      expect(citiesRepositoryMock.save).toHaveBeenCalledWith(city);
      expect(result).toEqual(city);
    });

    it('returns city unchanged when name is the same', async () => {
      const city = { id: 'city-4', name: 'Kazan' } as City;
      citiesRepositoryMock.findOne.mockResolvedValue(city);
      citiesRepositoryMock.save.mockResolvedValue(city);

      const result = await service.update('city-4', { name: 'Kazan' });

      expect(citiesRepositoryMock.findOne).toHaveBeenCalledTimes(1);
      expect(citiesRepositoryMock.save).toHaveBeenCalledWith(city);
      expect(result).toEqual(city);
    });

    it('throws NotFoundException when city does not exist', async () => {
      citiesRepositoryMock.findOne.mockResolvedValue(null);

      await expect(
        service.update('missing-city', { name: 'Any' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws ConflictException when new name already exists', async () => {
      const city = { id: 'city-5', name: 'Moscow' } as City;
      citiesRepositoryMock.findOne
        .mockResolvedValueOnce(city)
        .mockResolvedValueOnce({ id: 'city-6', name: 'Kazan' });

      await expect(
        service.update('city-5', { name: 'Kazan' }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(citiesRepositoryMock.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('removes city when it exists', async () => {
      const city = { id: 'city-7', name: 'Kazan' } as City;
      citiesRepositoryMock.findOne.mockResolvedValue(city);
      citiesRepositoryMock.remove.mockResolvedValue(undefined);

      await service.remove('city-7');

      expect(citiesRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: 'city-7' },
      });
      expect(citiesRepositoryMock.remove).toHaveBeenCalledWith(city);
    });

    it('throws NotFoundException when city is missing', async () => {
      citiesRepositoryMock.findOne.mockResolvedValue(null);

      await expect(service.remove('missing-city')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
