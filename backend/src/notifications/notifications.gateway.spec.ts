import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsGateWay } from './notifications.gateway';

describe('NotificationsGateWay', () => {
  let provider: NotificationsGateWay;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationsGateWay],
    }).compile();

    provider = module.get<NotificationsGateWay>(NotificationsGateWay);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
