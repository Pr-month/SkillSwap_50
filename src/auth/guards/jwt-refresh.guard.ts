import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

export interface RefreshRequest extends Request {
  refreshToken?: string;
  refreshUserId?: number;
}

@Injectable()
export class JwtRefreshGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService, // <-- Добавили
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RefreshRequest>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Refresh token не передан');
    }

    try {
      const payload = await this.jwtService.verifyAsync<{ sub: number }>(
        token,
        {
          // <-- Берем секрет из конфига
          secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        },
      );
      if (!Number.isSafeInteger(payload.sub) || payload.sub <= 0) {
        throw new UnauthorizedException();
      }
      request.refreshToken = token;
      request.refreshUserId = payload.sub;
      return true;
    } catch {
      throw new UnauthorizedException('Refresh token недействителен');
    }
  }

  private extractToken(request: RefreshRequest): string | undefined {
    const [type, bearer] = request.headers.authorization?.split(' ') ?? [];
    if (type === 'Bearer' && bearer) return bearer;

    const body = request.body as { refreshToken?: string } | undefined;
    return body?.refreshToken;
  }
}
