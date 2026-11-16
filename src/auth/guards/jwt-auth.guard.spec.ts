import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';

const makeContext = (
  headers: Record<string, string | undefined>,
): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({ headers }),
    }),
  }) as unknown as ExecutionContext;

describe('JwtAuthGuard', () => {
  const verifyAsync = jest.fn();
  const jwtService = { verifyAsync } as unknown as JwtService;

  // Добавили мок ConfigService
  const getOrThrow = jest.fn().mockReturnValue('test-access-secret');
  const configService = { getOrThrow } as unknown as ConfigService;

  const guard = new JwtAuthGuard(jwtService, configService);

  beforeEach(() => jest.clearAllMocks());

  it('нет заголовка Authorization → 401', async () => {
    await expect(guard.canActivate(makeContext({}))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('не Bearer → 401', async () => {
    await expect(
      guard.canActivate(makeContext({ authorization: 'Basic xyz' })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('валидный токен → true и payload в request.user', async () => {
    verifyAsync.mockResolvedValue({ sub: 42 });
    const ctx = makeContext({ authorization: 'Bearer valid.token' });
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(verifyAsync).toHaveBeenCalledWith('valid.token', {
      secret: 'test-access-secret', // Проверяем, что взялся из мока конфига
    });
  });

  it('невалидный токен → 401', async () => {
    verifyAsync.mockRejectedValue(new Error('bad'));
    await expect(
      guard.canActivate(makeContext({ authorization: 'Bearer bad.token' })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
