import { Test, TestingModule } from '@nestjs/testing';
import { RefreshJwtAuthGuard } from './refresh-jwt-auth.guard';

describe('RefreshJwtAuthGuard', () => {
  let guard: RefreshJwtAuthGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RefreshJwtAuthGuard],
    }).compile();

    guard = module.get<RefreshJwtAuthGuard>(RefreshJwtAuthGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('exposes passport guard methods', () => {
    expect(typeof guard.canActivate).toBe('function');
    expect(typeof guard.handleRequest).toBe('function');
  });
});
