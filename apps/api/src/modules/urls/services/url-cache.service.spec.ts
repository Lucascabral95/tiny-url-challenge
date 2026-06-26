import Redis from 'ioredis';
import { UrlCacheService } from './url-cache.service';

jest.mock('ioredis');

describe('UrlCacheService', () => {
  let redisClient: {
    get: jest.Mock;
    set: jest.Mock;
    quit: jest.Mock;
    disconnect: jest.Mock;
    on: jest.Mock;
  };
  let service: UrlCacheService;

  beforeEach(() => {
    redisClient = {
      get: jest.fn(),
      set: jest.fn(),
      quit: jest.fn().mockResolvedValue('OK'),
      disconnect: jest.fn(),
      on: jest.fn(),
    };

    jest.spyOn(Date, 'now').mockReturnValue(1_000);
    jest
      .mocked(Redis)
      .mockImplementation(() => redisClient as unknown as Redis);

    service = new UrlCacheService();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return cached original URL when Redis is available', async () => {
    redisClient.get.mockResolvedValue('https://example.com');

    await expect(service.getOriginalUrl('AbC12345')).resolves.toBe(
      'https://example.com',
    );

    expect(redisClient.get).toHaveBeenCalledWith('tiny-url:AbC12345');
  });

  it('should open the circuit and bypass Redis after a read failure', async () => {
    redisClient.get.mockRejectedValue(new Error('redis unavailable'));

    await expect(service.getOriginalUrl('AbC12345')).resolves.toBeNull();
    await expect(service.getOriginalUrl('AbC12345')).resolves.toBeNull();

    expect(redisClient.get).toHaveBeenCalledTimes(1);
  });

  it('should retry Redis after the circuit breaker cooldown', async () => {
    redisClient.get
      .mockRejectedValueOnce(new Error('redis unavailable'))
      .mockResolvedValueOnce('https://example.com');

    await expect(service.getOriginalUrl('AbC12345')).resolves.toBeNull();

    jest.spyOn(Date, 'now').mockReturnValue(31_001);

    await expect(service.getOriginalUrl('AbC12345')).resolves.toBe(
      'https://example.com',
    );

    expect(redisClient.get).toHaveBeenCalledTimes(2);
  });

  it('should skip Redis writes while the circuit is open', async () => {
    redisClient.get.mockRejectedValue(new Error('redis unavailable'));

    await service.getOriginalUrl('AbC12345');
    await service.setOriginalUrl('AbC12345', 'https://example.com');

    expect(redisClient.set).not.toHaveBeenCalled();
  });

  it('should expose cache status when circuit is closed', () => {
    expect(service.getStatus()).toEqual({
      state: 'available',
      circuitOpen: false,
      unavailableUntil: null,
      ttlSeconds: 86400,
    });
  });

  it('should expose cache status when circuit is open', async () => {
    redisClient.get.mockRejectedValue(new Error('redis unavailable'));

    await service.getOriginalUrl('AbC12345');

    expect(service.getStatus()).toEqual({
      state: 'bypassed',
      circuitOpen: true,
      unavailableUntil: new Date(31_000).toISOString(),
      ttlSeconds: 86400,
    });
  });

  it('should close Redis gracefully on module destroy', async () => {
    await service.onModuleDestroy();

    expect(redisClient.quit).toHaveBeenCalled();
    expect(redisClient.disconnect).not.toHaveBeenCalled();
  });

  it('should force disconnect when Redis graceful shutdown fails', async () => {
    redisClient.quit.mockRejectedValue(new Error('quit failed'));

    await service.onModuleDestroy();

    expect(redisClient.disconnect).toHaveBeenCalled();
  });
});
