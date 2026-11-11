import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import jwtConfig from '../config/jwt.config';
import { JwtPayload } from './auth.types';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-access',
) {
  constructor(@Inject(jwtConfig.KEY) config: ConfigType<typeof jwtConfig>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      algorithms: ['HS256'],
      secretOrKeyProvider: (_request, _token, done) => {
        const { accessSecret, refreshSecret } = config;
        if (!accessSecret?.trim() || accessSecret === refreshSecret) {
          done(new UnauthorizedException());
          return;
        }
        done(null, accessSecret);
      },
    });
  }

  validate(payload: Partial<JwtPayload> & { exp?: number }): JwtPayload {
    const { sub, exp } = payload;
    if (
      typeof sub !== 'number' ||
      !Number.isSafeInteger(sub) ||
      sub <= 0 ||
      typeof exp !== 'number' ||
      !Number.isFinite(exp)
    ) {
      throw new UnauthorizedException();
    }
    return { sub };
  }
}
