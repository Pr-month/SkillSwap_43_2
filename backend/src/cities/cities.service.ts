import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { City } from './entities/city.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CitiesService {
  constructor(
    @InjectRepository(City)
    private readonly citiesRepository: Repository<City>,
  ) {}

  create() {
    return 'This action adds a new city';
  }

  findAll() {
    return this.citiesRepository.find({
      take: 10,
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} city`;
  }

  update(id: number) {
    return `This action updates a #${id} city`;
  }

  remove(id: number) {
    return `This action removes a #${id} city`;
  }
}
