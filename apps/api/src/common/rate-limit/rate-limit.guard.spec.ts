import { ExecutionContext, HttpException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request, Response } from 'express';
import { RateLimitGuard } from './rate-limit.guard';

describe('RateLimitGuard', () => {
  let guard: RateLimitGuard;
  let reflector: jest.Mocked<Pick<Reflector, 'getAllAndOverride'>>;
  let request: Request;
  let response: jest.Mocked<Pick<Response, 'setHeader'>>;
  let context: ExecutionContext;
  let getHeader: jest.Mock;

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(1_000);

    reflector = {
      getAllAndOverride: jest.fn().mockReturnValue({
        keyPrefix: 'test',
        limit: 2,
        windowMs: 60_000,
      }),
    };
    guard = new RateLimitGuard(reflector as Reflector);

    getHeader = jest.fn();
    request = {
      ip: '127.0.0.1',
      socket: {},
      get: getHeader,
    } as unknown as Request;
    response = {
      setHeader: jest.fn(),
    };
    context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: () => request,
        getResponse: () => response,
      }),
    } as unknown as ExecutionContext;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should allow requests below the configured limit', () => {
    expect(guard.canActivate(context)).toBe(true);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should reject requests above the configured limit', () => {
    guard.canActivate(context);
    guard.canActivate(context);

    expect(() => guard.canActivate(context)).toThrow(HttpException);
    expect(response.setHeader).toHaveBeenCalledWith('Retry-After', '60');
  });

  it('should reset the bucket after the window expires', () => {
    guard.canActivate(context);
    guard.canActivate(context);

    jest.spyOn(Date, 'now').mockReturnValue(61_001);

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should use x-forwarded-for when available', () => {
    getHeader.mockReturnValue('10.0.0.1, 10.0.0.2');

    expect(guard.canActivate(context)).toBe(true);

    expect(getHeader).toHaveBeenCalledWith('x-forwarded-for');
  });
});
