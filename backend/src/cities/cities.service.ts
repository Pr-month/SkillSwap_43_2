import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from './entities/city.entity';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';

@Injectable()
export class CitiesService {
  constructor(
    @InjectRepository(City)
    private readonly citiesRepository: Repository<City>,
  ) {}

  async create(dto: CreateCityDto): Promise<City> {
    const existingCity = await this.citiesRepository.findOne({
      where: { name: dto.name },
    });
    if (existingCity) {
      throw new ConflictException('City with this name already exists');
    }

    const city = this.citiesRepository.create({ name: dto.name });
    return this.citiesRepository.save(city);
  }

  findAll() {
    return this.citiesRepository.find({
      take: 10,
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} city`;
  }

  async update(id: string, dto: UpdateCityDto): Promise<City> {
    const city = await this.citiesRepository.findOne({ where: { id } });
    if (!city) {
      throw new NotFoundException('City not found');
    }

    if (dto.name && dto.name !== city.name) {
      const existingCity = await this.citiesRepository.findOne({
        where: { name: dto.name },
      });
      if (existingCity) {
        throw new ConflictException('City with this name already exists');
      }
      city.name = dto.name;
    }

    return this.citiesRepository.save(city);
  }

  async remove(id: string): Promise<void> {
    const city = await this.citiesRepository.findOne({ where: { id } });
    if (!city) {
      throw new NotFoundException('City not found');
    }
    await this.citiesRepository.remove(city);
  }
}
