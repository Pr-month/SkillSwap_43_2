import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { Request } from './entities/request.entity';
import { User } from '../users/entities/user.entity';
import { Skill } from '../skills/entities/skill.entity';
import { Status } from './requests.enums';
import { Roles } from '../users/users.enums';

describe('RequestsService', () => {
  let service: RequestsService;
  const requestsRepositoryMock = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };
  const usersRepositoryMock = {
    findOne: jest.fn(),
  };
  const skillsRepositoryMock = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestsService,
        {
          provide: getRepositoryToken(Request),
          useValue: requestsRepositoryMock,
        },
        { provide: getRepositoryToken(User), useValue: usersRepositoryMock },
        { provide: getRepositoryToken(Skill), useValue: skillsRepositoryMock },
      ],
    }).compile();

    service = module.get<RequestsService>(RequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const dto = {
      offeredSkillId: 'offered-1',
      requestedSkillId: 'requested-1',
    };

    it('creates request successfully', async () => {
      const sender = { id: 'sender-1' };
      const receiver = { id: 'receiver-1' };
      const offeredSkill = { id: 'offered-1', owner: sender };
      const requestedSkill = { id: 'requested-1', owner: receiver };
      const created = { id: 'request-1' };
      const saved = { ...created, status: Status.PENDING };
      usersRepositoryMock.findOne.mockResolvedValue(sender);
      skillsRepositoryMock.findOne
        .mockResolvedValueOnce(offeredSkill)
        .mockResolvedValueOnce(requestedSkill);
      requestsRepositoryMock.create.mockReturnValue(created);
      requestsRepositoryMock.save.mockResolvedValue(saved);

      const result = await service.create('sender-1', dto);

      expect(requestsRepositoryMock.create).toHaveBeenCalledWith({
        sender,
        receiver,
        offeredSkill,
        requestedSkill,
      });
      expect(result).toEqual(saved);
    });

    it('throws when sender is missing', async () => {
      usersRepositoryMock.findOne.mockResolvedValue(null);

      await expect(service.create('missing-user', dto)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('throws when offered skill is missing', async () => {
      usersRepositoryMock.findOne.mockResolvedValue({ id: 'sender-1' });
      skillsRepositoryMock.findOne.mockResolvedValueOnce(null);

      await expect(service.create('sender-1', dto)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('throws when requested skill is missing', async () => {
      usersRepositoryMock.findOne.mockResolvedValue({ id: 'sender-1' });
      skillsRepositoryMock.findOne
        .mockResolvedValueOnce({ id: 'offered-1', owner: { id: 'sender-1' } })
        .mockResolvedValueOnce(null);

      await expect(service.create('sender-1', dto)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('throws when offered skill does not belong to sender', async () => {
      usersRepositoryMock.findOne.mockResolvedValue({ id: 'sender-1' });
      skillsRepositoryMock.findOne
        .mockResolvedValueOnce({ id: 'offered-1', owner: { id: 'other-user' } })
        .mockResolvedValueOnce({
          id: 'requested-1',
          owner: { id: 'receiver-1' },
        });

      await expect(service.create('sender-1', dto)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('throws when trying to create request to yourself', async () => {
      usersRepositoryMock.findOne.mockResolvedValue({ id: 'sender-1' });
      skillsRepositoryMock.findOne
        .mockResolvedValueOnce({ id: 'offered-1', owner: { id: 'sender-1' } })
        .mockResolvedValueOnce({
          id: 'requested-1',
          owner: { id: 'sender-1' },
        });

      await expect(service.create('sender-1', dto)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });
  });

  describe('findIncoming', () => {
    it('queries incoming requests with expected filters', async () => {
      const expected = [{ id: 'request-1' }];
      requestsRepositoryMock.find.mockResolvedValue(expected);

      const result = await service.findIncoming('receiver-1');

      expect(requestsRepositoryMock.find).toHaveBeenCalledWith({
        where: [
          { receiver: { id: 'receiver-1' }, status: Status.PENDING },
          { receiver: { id: 'receiver-1' }, status: Status.INPROGRESS },
        ],
        relations: {
          sender: true,
          receiver: true,
          offeredSkill: true,
          requestedSkill: true,
        },
      });
      expect(result).toEqual(expected);
    });
  });

  describe('findAll', () => {
    it('returns placeholder string', () => {
      expect(service.findAll()).toBe('This action returns all requests');
    });
  });

  describe('findOutgoing', () => {
    it('queries outgoing requests with expected filters', async () => {
      const expected = [{ id: 'request-2' }];
      requestsRepositoryMock.find.mockResolvedValue(expected);

      const result = await service.findOutgoing('sender-1');

      expect(requestsRepositoryMock.find).toHaveBeenCalledWith({
        where: [
          { sender: { id: 'sender-1' }, status: Status.PENDING },
          { sender: { id: 'sender-1' }, status: Status.INPROGRESS },
        ],
        relations: {
          sender: true,
          receiver: true,
          offeredSkill: true,
          requestedSkill: true,
        },
      });
      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('returns placeholder string with id', () => {
      expect(service.findOne(7)).toBe('This action returns a #7 request');
    });
  });

  describe('update', () => {
    it('throws when request is missing', async () => {
      requestsRepositoryMock.findOne.mockResolvedValue(null);

      await expect(
        service.update('request-1', { status: Status.ACCEPTED }, 'receiver-1'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws when user is not receiver', async () => {
      requestsRepositoryMock.findOne.mockResolvedValue({
        id: 'request-1',
        receiver: { id: 'receiver-1' },
      });

      await expect(
        service.update('request-1', { status: Status.ACCEPTED }, 'other-user'),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('updates request status and saves', async () => {
      const request = {
        id: 'request-1',
        receiver: { id: 'receiver-1' },
      } as any;
      requestsRepositoryMock.findOne.mockResolvedValue(request);
      requestsRepositoryMock.save.mockResolvedValue({
        ...request,
        status: Status.ACCEPTED,
      });

      const result = await service.update(
        'request-1',
        { status: Status.ACCEPTED },
        'receiver-1',
      );

      expect(requestsRepositoryMock.save).toHaveBeenCalledWith({
        ...request,
        status: Status.ACCEPTED,
      });
      expect(result.status).toBe(Status.ACCEPTED);
    });
  });

  describe('remove', () => {
    it('throws when request is missing', async () => {
      requestsRepositoryMock.findOne.mockResolvedValue(null);

      await expect(
        service.remove('request-1', 'sender-1'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws when current user is missing', async () => {
      requestsRepositoryMock.findOne.mockResolvedValue({
        id: 'request-1',
        sender: { id: 'sender-1' },
      });
      usersRepositoryMock.findOne.mockResolvedValue(null);

      await expect(
        service.remove('request-1', 'sender-1'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws when non-admin tries to remove foreign request', async () => {
      requestsRepositoryMock.findOne.mockResolvedValue({
        id: 'request-1',
        sender: { id: 'sender-1' },
      });
      usersRepositoryMock.findOne.mockResolvedValue({
        id: 'receiver-1',
        role: Roles.USER,
      });

      await expect(
        service.remove('request-1', 'receiver-1'),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('removes own request for regular user', async () => {
      const request = { id: 'request-1', sender: { id: 'sender-1' } };
      requestsRepositoryMock.findOne.mockResolvedValue(request);
      usersRepositoryMock.findOne.mockResolvedValue({
        id: 'sender-1',
        role: Roles.USER,
      });
      requestsRepositoryMock.remove.mockResolvedValue(undefined);

      await service.remove('request-1', 'sender-1');

      expect(requestsRepositoryMock.remove).toHaveBeenCalledWith(request);
    });

    it('allows admin to remove any request', async () => {
      const request = { id: 'request-1', sender: { id: 'sender-1' } };
      requestsRepositoryMock.findOne.mockResolvedValue(request);
      usersRepositoryMock.findOne.mockResolvedValue({
        id: 'admin-1',
        role: Roles.ADMIN,
      });
      requestsRepositoryMock.remove.mockResolvedValue(undefined);

      await service.remove('request-1', 'admin-1');

      expect(requestsRepositoryMock.remove).toHaveBeenCalledWith(request);
    });
  });
});
