import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Roles } from 'src/users/users.enums';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: { getAllAndOverride: jest.Mock };

  const handler = jest.fn();
  class TestController {}

  const createExecutionContext = (user?: { role?: Roles }) =>
    ({
      getHandler: () => handler,
      getClass: () => TestController,
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    };
    guard = new RolesGuard(reflector as unknown as Reflector);
  });

  it('returns true when no roles metadata is set', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const context = createExecutionContext({ role: Roles.USER });

    const result = guard.canActivate(context);

    expect(result).toBe(true);
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
      handler,
      TestController,
    ]);
  });

  it('returns true when user role matches required role', () => {
    reflector.getAllAndOverride.mockReturnValue([Roles.ADMIN]);
    const context = createExecutionContext({ role: Roles.ADMIN });

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('returns false when user role does not match required role', () => {
    reflector.getAllAndOverride.mockReturnValue([Roles.ADMIN]);
    const context = createExecutionContext({ role: Roles.USER });

    const result = guard.canActivate(context);

    expect(result).toBe(false);
  });

  it('returns false when request has no user', () => {
    reflector.getAllAndOverride.mockReturnValue([Roles.USER]);
    const context = createExecutionContext();

    const result = guard.canActivate(context);

    expect(result).toBe(false);
  });
});
