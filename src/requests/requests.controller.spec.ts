import { Test, TestingModule } from '@nestjs/testing';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';
import { Status } from './requests.enums';

describe('RequestsController', () => {
  let controller: RequestsController;
  const requestsServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findIncoming: jest.fn(),
    findOutgoing: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RequestsController],
      providers: [{ provide: RequestsService, useValue: requestsServiceMock }],
    }).compile();

    controller = module.get<RequestsController>(RequestsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates create to RequestsService with user id', async () => {
    const req = { user: { sub: 'sender-1' } } as any;
    const dto = {
      offeredSkillId: 'offered-1',
      requestedSkillId: 'requested-1',
    };
    const expected = { id: 'request-1' };
    requestsServiceMock.create.mockResolvedValue(expected);

    const result = await controller.create(req, dto);

    expect(requestsServiceMock.create).toHaveBeenCalledWith('sender-1', dto);
    expect(result).toEqual(expected);
  });

  it('delegates findAll to RequestsService', () => {
    requestsServiceMock.findAll.mockReturnValue('all requests');

    const result = controller.findAll();

    expect(requestsServiceMock.findAll).toHaveBeenCalled();
    expect(result).toBe('all requests');
  });

  it('delegates findIncoming to RequestsService with user id', async () => {
    const req = { user: { sub: 'receiver-1' } } as any;
    const expected = [{ id: 'request-1' }];
    requestsServiceMock.findIncoming.mockResolvedValue(expected);

    const result = await controller.findIncoming(req);

    expect(requestsServiceMock.findIncoming).toHaveBeenCalledWith('receiver-1');
    expect(result).toEqual(expected);
  });

  it('delegates findOutgoing to RequestsService with user id', async () => {
    const req = { user: { sub: 'sender-2' } } as any;
    const expected = [{ id: 'request-2' }];
    requestsServiceMock.findOutgoing.mockResolvedValue(expected);

    const result = await controller.findOutgoing(req);

    expect(requestsServiceMock.findOutgoing).toHaveBeenCalledWith('sender-2');
    expect(result).toEqual(expected);
  });

  it('delegates findOne to RequestsService', () => {
    requestsServiceMock.findOne.mockReturnValue('request #2');

    const result = controller.findOne('2');

    expect(requestsServiceMock.findOne).toHaveBeenCalledWith(2);
    expect(result).toBe('request #2');
  });

  it('delegates update to RequestsService', async () => {
    const req = { user: { sub: 'receiver-3' } } as any;
    const dto = { status: Status.ACCEPTED };
    const expected = { id: 'request-3', status: Status.ACCEPTED };
    requestsServiceMock.update.mockResolvedValue(expected);

    const result = await controller.update('request-3', dto, req);

    expect(requestsServiceMock.update).toHaveBeenCalledWith(
      'request-3',
      dto,
      'receiver-3',
    );
    expect(result).toEqual(expected);
  });

  it('delegates remove to RequestsService', async () => {
    const req = { user: { sub: 'sender-3' } } as any;
    requestsServiceMock.remove.mockResolvedValue(undefined);

    const result = await controller.remove('request-4', req);

    expect(requestsServiceMock.remove).toHaveBeenCalledWith(
      'request-4',
      'sender-3',
    );
    expect(result).toBeUndefined();
  });
});
