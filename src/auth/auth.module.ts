import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import jwtConfig from '../config/jwt.config'; // Из будущего PR
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard'; // Из будущего PR

@Module({
  imports: [
    ConfigModule.forFeature(jwtConfig),
    PassportModule,
    JwtModule.registerAsync({
      inject: [jwtConfig.KEY],
      useFactory: (config: ConfigType<typeof jwtConfig>): JwtModuleOptions => ({
        secret: config.accessSecret,
        signOptions: {
          expiresIn: config.accessExpiresIn,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtRefreshGuard], // Добавили гард
  exports: [JwtRefreshGuard],
})
export class AuthModule {}
