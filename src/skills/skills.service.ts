import { Injectable, NotFoundException } from '@nestjs/common';
import {
  GetSkillsDto,
  FilteredSkillsWithPagination,
} from './dto/get-skills.dto';
import { Skill } from './entities/skill.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Modes } from './skills.enums';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
  ) {}

  async findAll(
    getSkillsDto: GetSkillsDto,
  ): Promise<FilteredSkillsWithPagination> {
    const { categories, search, gender, location, mode, cursor, limit } =
      getSkillsDto;

    const baseQuery = this.skillsRepository
      .createQueryBuilder('skill')
      .leftJoinAndSelect('skill.category', 'category')
      .leftJoinAndSelect('skill.owner', 'user')
      .where('1=1');

    if (mode === Modes.CAN && hasCategories) {
      baseQuery.andWhere('category.id IN (:categories)', { categories });
    }

    if (mode === Modes.WANT && hasCategories) {
      baseQuery.andWhere('user.wantToLearn::text[] && :categories', {
        categories,
      });
    }

    if (search) {
      baseQuery.andWhere('skill.title ILIKE :search', {
        search: `%${search}%`,
      });
    }

    if (gender) {
      baseQuery.andWhere('user.gender = :gender', { gender });
    }

    if (location) {
      baseQuery.andWhere('user.city = :location', { location });
    }

    const firstQuery = baseQuery;

    if (cursor) {
      firstQuery.andWhere('skill.id > :cursor', { cursor });
    }

    firstQuery.orderBy('skill.id', 'ASC').limit(limit);

    const data = await firstQuery.getMany();

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
    const secondQuery = baseQuery;

    if (data.length === limit) {
      secondQuery
        .andWhere('skill.id > :lastId', { lastId: data[data.length - 1].id })
        .orderBy('skill.id', 'ASC');

      const nextCheck = await secondQuery.take(1).getOne();

      hasNextPage = !!nextCheck;
    }

    return {
      data: transformedData,
      hasNextPage,
      nextCursor: hasNextPage ? data[data.length - 1].id : '',
    };
  }

  async remove(id: string): Promise<void> {
    const skill = await this.skillsRepository.findOne({
      where: { id },
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    await this.skillsRepository.remove(skill);
  }
}
