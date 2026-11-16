import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { ConfigType } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import jwtConfig from '../config/jwt.config'; // Файл из будущего PR

@Injectable()
export class AuthService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly config: ConfigType<typeof jwtConfig>, // Конфиг из будущего PR
  ) {}

  async refresh(userId: number, rawRefreshToken: string) {
    const user = await this.dataSource.getRepository(User).findOne({
      where: { id: userId },
    });

    // Проверка: существует ли юзер и совпадает ли токен с БД
    if (!user || !user.refreshToken || user.refreshToken !== rawRefreshToken) {
      throw new UnauthorizedException('Доступ запрещен');
    }

    // Генерируем новую пару (Token Rotation)
    const tokens = await this.generateTokens(user);

    // Обновляем токен в БД
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  // Этот метод будет также использоваться в login (из другого PR)
  private async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.accessSecret,
        expiresIn: this.config.accessExpiresIn,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.refreshSecret,
        expiresIn: this.config.refreshExpiresIn,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async updateRefreshToken(userId: number, refreshToken: string) {
    await this.dataSource.getRepository(User).update(userId, { refreshToken });
  }
}
