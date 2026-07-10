import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  GetSkillsDto,
  FilteredSkillsWithPagination,
} from './dto/get-skills.dto';
import { Skill } from './entities/skill.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ArrayContains } from 'typeorm';
import { Modes } from './skills.enums';
import { User } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async create(ownerId: string, dto: CreateSkillDto): Promise<Skill> {
    const owner = await this.usersRepository.findOne({
      where: { id: ownerId },
    });
    if (!owner) {
      throw new NotFoundException('User not found');
    }

    const category = await this.categoriesRepository.findOne({
      where: { id: dto.categoryId },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const skill = this.skillsRepository.create({
      title: dto.title,
      description: dto.description,
      images: dto.images ?? [],
      owner,
      category,
    });

    return this.skillsRepository.save(skill);
  }

  async favoriteSkill(skillId: string, ownerId: string): Promise<User> {
    const favoriteSkill = await this.skillsRepository.findOne({
      where: { id: skillId },
    });
    if (!favoriteSkill) {
      throw new NotFoundException('Skill not found');
    }

    const owner = await this.usersRepository.findOne({
      where: { id: ownerId },
    });
    if (!owner) {
      throw new NotFoundException('User not found');
    }
    owner.favoriteSkills = owner.favoriteSkills ?? [];
    owner.favoriteSkills.push(favoriteSkill);

    return await this.usersRepository.save(owner);
  }

  async unfavoriteSkill(id: string, ownerId: string): Promise<User> {
    const skill = await this.skillsRepository.findOne({
      where: { id },
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    const owner = await this.usersRepository.findOne({
      where: { id: ownerId },
      relations: { favoriteSkills: true },
    });

    if (!owner) {
      throw new NotFoundException('User not found');
    }
    const favoriteSkills = owner.favoriteSkills ?? [];
    const skillIndex: number =
      owner.favoriteSkills?.findIndex(
        (element) => element.id === skill.id,
      ) ?? -1;
    if (skillIndex === -1) {
      throw new NotFoundException('Skill not found');
    }
    favoriteSkills.splice(skillIndex, 1);
    owner.favoriteSkills = favoriteSkills;
    return await this.usersRepository.save(owner);
  }

  async findAll(
    getSkillsDto: GetSkillsDto,
  ): Promise<FilteredSkillsWithPagination> {
    const { categories, search, gender, location, mode, cursor, limit } =
      getSkillsDto;
    const hasCategories = Array.isArray(categories) && categories.length > 0;

    const baseQuery = this.skillsRepository
      .createQueryBuilder('skill')
      .leftJoinAndSelect('skill.category', 'category')
      .leftJoinAndSelect('skill.owner', 'user')
      .leftJoinAndSelect('user.wantToLearn', 'wantToLearn')
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
        wantToLearn: (item.owner.wantToLearn ?? []).map((category) => {
          return { id: category.id, name: category.name };
        }),
        city: item.owner.city,
        birthdate: item.owner.birthdate,
        avatar: item.owner.avatar ?? null,
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

  async findOne(id: string): Promise<Skill> {
    const skill = await this.skillsRepository.findOne({
      where: { id },
      relations: { owner: true, category: true },
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    return skill;
  }

  async update(
    id: string,
    ownerId: string,
    dto: UpdateSkillDto,
  ): Promise<Skill> {
    const skill = await this.skillsRepository.findOne({
      where: { id },
      relations: { owner: true, category: true },
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    if (skill.owner.id !== ownerId) {
      throw new ForbiddenException('You can update only your own skill');
    }

    if (dto.categoryId) {
      const category = await this.categoriesRepository.findOne({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new NotFoundException('Category not found');
      }
      skill.category = category;
    }

    if (dto.title !== undefined) {
      skill.title = dto.title;
    }

    if (dto.description !== undefined) {
      skill.description = dto.description;
    }

    if (dto.images !== undefined) {
      skill.images = dto.images;
    }

    return this.skillsRepository.save(skill);
  }

  async remove(id: string, ownerId: string): Promise<void> {
    const skill = await this.skillsRepository.findOne({
      where: { id },
      relations: { owner: true },
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    if (skill.owner.id !== ownerId) {
      throw new ForbiddenException('You can only delete your own skill');
    }

    await this.skillsRepository.remove(skill);
  }

  async getSimilar(id: string): Promise<User[]> {
    const skill = await this.skillsRepository.findOne({
      where: { id },
    });
    if (!skill) {
      throw new NotFoundException('Skill not found');
    }
    const category = await this.categoriesRepository.findOne({
      where: {
        children: ArrayContains([skill]),
      },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    const similarUsers = await this.usersRepository.find({
      take: 10,
      where: {
        skills: { category },
      },
    });
    return similarUsers;
  }
}
