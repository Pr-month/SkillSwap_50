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
      await this.jwtService.verifyAsync(token, {
        // <-- Берем секрет из конфига
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
      request.refreshToken = token;
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
