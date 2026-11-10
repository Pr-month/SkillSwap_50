import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtRefreshGuard } from './jwt-refresh.guard';

const makeContext = (
  headers: Record<string, string | undefined> = {},
  body: Record<string, unknown> = {},
): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({ headers, body }),
    }),
  }) as unknown as ExecutionContext;

describe('JwtRefreshGuard', () => {
  const verifyAsync = jest.fn();
  const jwtService = { verifyAsync } as unknown as JwtService;
  const guard = new JwtRefreshGuard(jwtService);

  beforeEach(() => jest.clearAllMocks());

  it('нет токена (ни в header, ни в body) → 401', async () => {
    await expect(guard.canActivate(makeContext())).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('берёт токен из Authorization: Bearer', async () => {
    verifyAsync.mockResolvedValue({ sub: 1, jti: 'x', fam: 'y' });
    const ctx = makeContext({ authorization: 'Bearer refresh.token' });
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(verifyAsync).toHaveBeenCalledWith('refresh.token', {
      secret: process.env.JWT_REFRESH_SECRET,
    });
  });

  it('берёт токен из body.refreshToken', async () => {
    verifyAsync.mockResolvedValue({ sub: 1 });
    const ctx = makeContext({}, { refreshToken: 'refresh.from.body' });
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  it('невалидный токен → 401', async () => {
    verifyAsync.mockRejectedValue(new Error('bad'));
    await expect(
      guard.canActivate(makeContext({ authorization: 'Bearer bad' })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
