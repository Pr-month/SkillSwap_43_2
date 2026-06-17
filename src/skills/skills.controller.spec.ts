import { Test, TestingModule } from '@nestjs/testing';
import { SkillsController } from './skills.controller';
import { SkillsService } from './skills.service';

describe('SkillsController', () => {
  let controller: SkillsController;
  const skillsServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    favoriteSkill: jest.fn(),
    unfavoriteSkill: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SkillsController],
      providers: [{ provide: SkillsService, useValue: skillsServiceMock }],
    }).compile();

    controller = module.get<SkillsController>(SkillsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates create to SkillsService with owner id', async () => {
    const req = { user: { sub: 'owner-1' } } as any;
    const dto = { title: 'Skill', description: 'Desc', categoryId: 'cat-1' };
    const expected = { id: 'skill-1' };
    skillsServiceMock.create.mockResolvedValue(expected);

    const result = await controller.create(req, dto);

    expect(skillsServiceMock.create).toHaveBeenCalledWith('owner-1', dto);
    expect(result).toEqual(expected);
  });

  it('delegates findAll to SkillsService', async () => {
    const dto = { search: 'TypeScript', limit: 10 };
    const expected = { data: [], hasNextPage: false, nextCursor: '' };
    skillsServiceMock.findAll.mockResolvedValue(expected);

    const result = await controller.findAll(dto as any);

    expect(skillsServiceMock.findAll).toHaveBeenCalledWith(dto);
    expect(result).toEqual(expected);
  });

  it('delegates update to SkillsService', async () => {
    const req = { user: { sub: 'owner-2' } } as any;
    const dto = { title: 'Updated title' };
    const expected = { id: 'skill-2', title: 'Updated title' };
    skillsServiceMock.update.mockResolvedValue(expected);

    const result = await controller.update('skill-2', req, dto as any);

    expect(skillsServiceMock.update).toHaveBeenCalledWith('skill-2', 'owner-2', dto);
    expect(result).toEqual(expected);
  });

  it('delegates remove to SkillsService', async () => {
    const req = { user: { sub: 'owner-3' } } as any;
    skillsServiceMock.remove.mockResolvedValue(undefined);

    const result = await controller.remove('skill-3', req);

    expect(skillsServiceMock.remove).toHaveBeenCalledWith('skill-3', 'owner-3');
    expect(result).toBeUndefined();
  });

  it('delegates favoriteSkill to SkillsService', async () => {
    const req = { user: { sub: 'user-1' } } as any;
    const expected = { id: 'user-1' };
    skillsServiceMock.favoriteSkill.mockResolvedValue(expected);

    const result = await controller.favoriteSkill('skill-4', req);

    expect(skillsServiceMock.favoriteSkill).toHaveBeenCalledWith('skill-4', 'user-1');
    expect(result).toEqual(expected);
  });

  it('delegates unfavoriteSkill to SkillsService', async () => {
    const req = { user: { sub: 'user-2' } } as any;
    const expected = { id: 'user-2' };
    skillsServiceMock.unfavoriteSkill.mockResolvedValue(expected);

    const result = await controller.unfavoriteSkill('skill-5', req);

    expect(skillsServiceMock.unfavoriteSkill).toHaveBeenCalledWith('skill-5', 'user-2');
    expect(result).toEqual(expected);
  });
});
