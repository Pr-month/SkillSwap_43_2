import { Injectable } from '@nestjs/common';
import {
  GetSkillsDto,
  FilteredSkillsWithPagination,
} from './dto/get-skills.dto';
import { Skill } from './entities/skill.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
  ) {}

  async findAll(
    getSkillsDto: GetSkillsDto,
  ): Promise<FilteredSkillsWithPagination> {
    const { categories, search, gender, location, cursor, limit } =
      getSkillsDto;

    const query = this.skillsRepository
      .createQueryBuilder('skill')
      .leftJoinAndSelect('skill.category', 'category')
      .leftJoinAndSelect('skill.owner', 'user');

    query.where('category.id IN (:...categors)', { categories });

    if (search) {
      query.andWhere('skill.title ILIKE :search', { search: `%${search}%` });
    }

    if (gender) {
      query.andWhere('user.gender = :gender', { gender });
    }

    if (location) {
      query.andWhere('user.city = :location', { location });
    }

    if (cursor) {
      query.andWhere('skill.id > :cursor', { cursor });
    }

    query.orderBy('skill.id', 'ASC').limit(limit);

    const data = await query.getMany();

    const transformedData = data.map((item) => ({
      user: {
        id: item.owner.id,
        name: item.owner.name,
        wantToLearn: item.owner.wantToLearn,
        city: item.owner.city,
        birthdate: item.owner.birthdate,
        avatar: item.owner.avatar,
      },
      skill: {
        title: item.title,
        category: item.category.id,
      },
    }));

    let hasNextPage = false;
    if (data.length === limit) {
      const nextCheck = await this.skillsRepository
        .createQueryBuilder('skill')
        .leftJoin('skill.category', 'category')
        .leftJoin('skill.owner', 'owner')
        .where('category.id IN (:...categories)', { categories })
        .andWhere('skill.title ILIKE :search', { search: `%${search}%` })
        .andWhere('owner.gender = :gender', { gender })
        .andWhere('owner.city = :location', { location })
        .andWhere('skill.id > :lastId', { lastId: data[data.length - 1].id })
        .orderBy('skill.id', 'ASC')
        .take(1)
        .getOne();

      hasNextPage = !!nextCheck;
    }

    return {
      data: transformedData,
      hasNextPage,
      nextCursor: hasNextPage ? data[data.length - 1].id : '',
    };
  }
}
