import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import jwtConfig from '../config/jwt.config';
import { AccessTokenGuard } from './access-token.guard';
import { AccessTokenStrategy } from './access-token.strategy';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forFeature(jwtConfig),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: {
        expiresIn: Number(process.env.JWT_ACCESS_EXPIRES_IN ?? 900),
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AccessTokenGuard, AccessTokenStrategy],
  exports: [AccessTokenGuard],
})
export class AuthModule {}
