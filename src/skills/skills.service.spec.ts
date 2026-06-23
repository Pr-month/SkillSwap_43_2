import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { Skill } from './entities/skill.entity';
import { User } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';
import { Modes } from './skills.enums';
import { Gender } from '../users/users.enums';

describe('SkillsService', () => {
  let service: SkillsService;
  const skillsRepositoryMock = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
  const usersRepositoryMock = {
    findOne: jest.fn(),
    save: jest.fn(),
  };
  const categoriesRepositoryMock = {
    findOne: jest.fn(),
  };

  const createQueryBuilderMock = () => {
    const qb = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
      getOne: jest.fn(),
    };
    return qb;
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillsService,
        { provide: getRepositoryToken(Skill), useValue: skillsRepositoryMock },
        { provide: getRepositoryToken(User), useValue: usersRepositoryMock },
        {
          provide: getRepositoryToken(Category),
          useValue: categoriesRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<SkillsService>(SkillsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const dto = {
      title: 'TypeScript',
      description: 'Programming language',
      categoryId: 'cat-1',
    };

    it('creates skill successfully', async () => {
      const owner = { id: 'user-1' };
      const category = { id: 'cat-1' };
      const created = { id: 'skill-1' };
      const saved = { ...created, owner, category };
      usersRepositoryMock.findOne.mockResolvedValue(owner);
      categoriesRepositoryMock.findOne.mockResolvedValue(category);
      skillsRepositoryMock.create.mockReturnValue(created);
      skillsRepositoryMock.save.mockResolvedValue(saved);

      const result = await service.create('user-1', dto as any);

      expect(skillsRepositoryMock.create).toHaveBeenCalledWith({
        title: dto.title,
        description: dto.description,
        images: [],
        owner,
        category,
      });
      expect(result).toEqual(saved);
    });

    it('throws when owner is missing', async () => {
      usersRepositoryMock.findOne.mockResolvedValue(null);

      await expect(
        service.create('missing-user', dto as any),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws when category is missing', async () => {
      usersRepositoryMock.findOne.mockResolvedValue({ id: 'user-1' });
      categoriesRepositoryMock.findOne.mockResolvedValue(null);

      await expect(service.create('user-1', dto as any)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('favoriteSkill', () => {
    it('adds skill to favorite list and saves user', async () => {
      const skill = { id: 'skill-1' };
      const owner = { id: 'user-1', favoriteSkills: [] as any[] };
      skillsRepositoryMock.findOne.mockResolvedValue(skill);
      usersRepositoryMock.findOne.mockResolvedValue(owner);
      usersRepositoryMock.save.mockResolvedValue(owner);

      const result = await service.favoriteSkill('skill-1', 'user-1');

      expect(owner.favoriteSkills).toEqual([skill]);
      expect(usersRepositoryMock.save).toHaveBeenCalledWith(owner);
      expect(result).toEqual(owner);
    });

    it('throws when skill is missing', async () => {
      skillsRepositoryMock.findOne.mockResolvedValue(null);

      await expect(
        service.favoriteSkill('missing-skill', 'user-1'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws when user is missing', async () => {
      skillsRepositoryMock.findOne.mockResolvedValue({ id: 'skill-1' });
      usersRepositoryMock.findOne.mockResolvedValue(null);

      await expect(
        service.favoriteSkill('skill-1', 'missing-user'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('initializes favorite list when it is undefined', async () => {
      const skill = { id: 'skill-1' };
      const owner = { id: 'user-1' } as any;
      skillsRepositoryMock.findOne.mockResolvedValue(skill);
      usersRepositoryMock.findOne.mockResolvedValue(owner);
      usersRepositoryMock.save.mockResolvedValue({
        ...owner,
        favoriteSkills: [skill],
      });

      await service.favoriteSkill('skill-1', 'user-1');

      expect(usersRepositoryMock.save).toHaveBeenCalledWith({
        ...owner,
        favoriteSkills: [skill],
      });
    });
  });

  describe('unfavoriteSkill', () => {
    it('removes skill from favorite list and saves user', async () => {
      const skill = { id: 'skill-1' };
      const owner = {
        id: 'user-1',
        favoriteSkills: [{ id: 'skill-1' }, { id: 'skill-2' }],
      };
      skillsRepositoryMock.findOne.mockResolvedValue(skill);
      usersRepositoryMock.findOne.mockResolvedValue(owner);
      usersRepositoryMock.save.mockResolvedValue(owner);

      const result = await service.unfavoriteSkill('skill-1', 'user-1');

      expect(owner.favoriteSkills).toEqual([{ id: 'skill-2' }]);
      expect(usersRepositoryMock.save).toHaveBeenCalledWith(owner);
      expect(result).toEqual(owner);
    });

    it('throws when skill is missing', async () => {
      skillsRepositoryMock.findOne.mockResolvedValue(null);

      await expect(
        service.unfavoriteSkill('missing-skill', 'user-1'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws when user is missing', async () => {
      skillsRepositoryMock.findOne.mockResolvedValue({ id: 'skill-1' });
      usersRepositoryMock.findOne.mockResolvedValue(null);

      await expect(
        service.unfavoriteSkill('skill-1', 'missing-user'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws when skill is absent in favorites', async () => {
      skillsRepositoryMock.findOne.mockResolvedValue({ id: 'skill-3' });
      usersRepositoryMock.findOne.mockResolvedValue({
        id: 'user-1',
        favoriteSkills: [{ id: 'skill-1' }],
      });

      await expect(
        service.unfavoriteSkill('skill-3', 'user-1'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws when favorites list is undefined', async () => {
      skillsRepositoryMock.findOne.mockResolvedValue({ id: 'skill-1' });
      usersRepositoryMock.findOne.mockResolvedValue({
        id: 'user-1',
      });

      await expect(
        service.unfavoriteSkill('skill-1', 'user-1'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('applies filters and returns transformed paginated response', async () => {
      const qb = createQueryBuilderMock();
      const firstSkill = {
        id: 'skill-1',
        title: 'TypeScript',
        category: { id: 'cat-1' },
        owner: {
          id: 'user-1',
          name: 'Alice',
          wantToLearn: [{ id: 'cat-2', name: 'Node.js' }],
          city: 'Berlin',
          birthdate: '1998-01-01',
          avatar: null,
        },
      };
      qb.getMany.mockResolvedValue([firstSkill]);
      qb.getOne.mockResolvedValue({ id: 'skill-2' });
      skillsRepositoryMock.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAll({
        categories: ['cat-1'],
        search: 'Type',
        gender: Gender.FEMALE,
        location: 'Berlin',
        mode: Modes.CAN,
        cursor: 'skill-0',
        limit: 1,
      } as any);

      expect(qb.andWhere).toHaveBeenCalledWith('category.id IN (:categories)', {
        categories: ['cat-1'],
      });
      expect(qb.andWhere).toHaveBeenCalledWith('skill.title ILIKE :search', {
        search: '%Type%',
      });
      expect(result).toEqual({
        data: [
          {
            user: {
              id: 'user-1',
              name: 'Alice',
              wantToLearn: [{ id: 'cat-2', name: 'Node.js' }],
              city: 'Berlin',
              birthdate: '1998-01-01',
              avatar: null,
            },
            skill: {
              title: 'TypeScript',
              category: 'cat-1',
            },
          },
        ],
        hasNextPage: true,
        nextCursor: 'skill-1',
      });
    });

    it('supports mode wantToLearn query', async () => {
      const qb = createQueryBuilderMock();
      qb.getMany.mockResolvedValue([]);
      skillsRepositoryMock.createQueryBuilder.mockReturnValue(qb);

      await service.findAll({
        categories: ['cat-10'],
        mode: Modes.WANT,
        limit: 20,
      } as any);

      expect(qb.andWhere).toHaveBeenCalledWith(
        'user.wantToLearn::text[] && :categories',
        { categories: ['cat-10'] },
      );
    });

    it('returns hasNextPage false when page is not full', async () => {
      const qb = createQueryBuilderMock();
      qb.getMany.mockResolvedValue([]);
      skillsRepositoryMock.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAll({ limit: 5 } as any);

      expect(result).toEqual({
        data: [],
        hasNextPage: false,
        nextCursor: '',
      });
      expect(qb.getOne).not.toHaveBeenCalled();
    });

    it('maps avatar and empty wantToLearn when relation is absent', async () => {
      const qb = createQueryBuilderMock();
      qb.getMany.mockResolvedValue([
        {
          id: 'skill-20',
          title: 'Go',
          category: { id: 'cat-20' },
          owner: {
            id: 'user-20',
            name: 'Bob',
            city: 'Paris',
            birthdate: '1990-10-10',
            avatar: 'avatar.png',
          },
        },
      ]);
      skillsRepositoryMock.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAll({ limit: 5 } as any);

      expect(result).toEqual({
        data: [
          {
            user: {
              id: 'user-20',
              name: 'Bob',
              wantToLearn: [],
              city: 'Paris',
              birthdate: '1990-10-10',
              avatar: 'avatar.png',
            },
            skill: {
              title: 'Go',
              category: 'cat-20',
            },
          },
        ],
        hasNextPage: false,
        nextCursor: '',
      });
    });
  });

  describe('findOne', () => {
    it('returns skill by id', async () => {
      const skill = { id: 'skill-1' };
      skillsRepositoryMock.findOne.mockResolvedValue(skill);

      const result = await service.findOne('skill-1');

      expect(result).toEqual(skill);
    });

    it('throws when skill is missing', async () => {
      skillsRepositoryMock.findOne.mockResolvedValue(null);

      await expect(service.findOne('missing-skill')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('throws when skill is missing', async () => {
      skillsRepositoryMock.findOne.mockResolvedValue(null);

      await expect(
        service.update('missing-skill', 'owner-1', {} as any),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws when updater is not owner', async () => {
      skillsRepositoryMock.findOne.mockResolvedValue({
        id: 'skill-1',
        owner: { id: 'owner-1' },
      });

      await expect(
        service.update('skill-1', 'other-user', {} as any),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('updates fields and category when valid', async () => {
      const skill = {
        id: 'skill-1',
        owner: { id: 'owner-1' },
        category: { id: 'cat-1' },
        title: 'Old',
        description: 'Old desc',
        images: ['old.png'],
      };
      const newCategory = { id: 'cat-2' };
      skillsRepositoryMock.findOne.mockResolvedValue(skill);
      categoriesRepositoryMock.findOne.mockResolvedValue(newCategory);
      skillsRepositoryMock.save.mockResolvedValue({
        ...skill,
        category: newCategory,
        title: 'New',
        description: 'New desc',
        images: ['new.png'],
      });

      const result = await service.update('skill-1', 'owner-1', {
        categoryId: 'cat-2',
        title: 'New',
        description: 'New desc',
        images: ['new.png'],
      } as any);

      expect(categoriesRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: 'cat-2' },
      });
      expect(skillsRepositoryMock.save).toHaveBeenCalled();
      expect(result.title).toBe('New');
      expect(result.category).toEqual(newCategory);
    });

    it('throws when new category does not exist', async () => {
      skillsRepositoryMock.findOne.mockResolvedValue({
        id: 'skill-1',
        owner: { id: 'owner-1' },
      });
      categoriesRepositoryMock.findOne.mockResolvedValue(null);

      await expect(
        service.update('skill-1', 'owner-1', {
          categoryId: 'missing-cat',
        } as any),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('remove', () => {
    it('throws when skill is missing', async () => {
      skillsRepositoryMock.findOne.mockResolvedValue(null);

      await expect(
        service.remove('missing-skill', 'owner-1'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws when removing user is not owner', async () => {
      skillsRepositoryMock.findOne.mockResolvedValue({
        id: 'skill-1',
        owner: { id: 'owner-1' },
      });

      await expect(
        service.remove('skill-1', 'other-user'),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('removes skill for owner', async () => {
      const skill = { id: 'skill-1', owner: { id: 'owner-1' } };
      skillsRepositoryMock.findOne.mockResolvedValue(skill);
      skillsRepositoryMock.remove.mockResolvedValue(undefined);

      await service.remove('skill-1', 'owner-1');

      expect(skillsRepositoryMock.remove).toHaveBeenCalledWith(skill);
    });
  });
});
