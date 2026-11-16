import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import jwtConfig from '../config/jwt.config';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { JwtPayload } from './auth.types';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';

const DUMMY_HASH =
  '$2b$10$CwTycUXWue0Thq9StjUM0uJ8lQ0uJ0Q0uJ0Q0uJ0Q0uJ0Q0uJ0Q0u';

@Injectable()
export class AuthService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    @Inject(jwtConfig.KEY)
    private readonly jwtSettings: ConfigType<typeof jwtConfig>,
  ) {}

  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.dataSource.getRepository(User).findOne({
      where: { email: dto.email },
    });

    const isValid = await bcrypt.compare(
      dto.password,
      user?.password ?? DUMMY_HASH,
    );

    if (!user || !isValid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const payload: JwtPayload = { sub: user.id };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const email = registerDto.email;
    const oldUser = await this.usersService.findByEmail(email);
    if (oldUser) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });
    const tokens = await this.generateTokens(user);
    const hashedTokens = await bcrypt.hash(tokens.refreshToken, 10);
    await this.usersService.updateRefreshToken(user.id, hashedTokens);

    const safeUser: Partial<User> = { ...user };
    delete safeUser.password;
    delete safeUser.refreshToken;

    return {
      user: safeUser,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      role: user.role,
    };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.jwtSettings.accessSecret,
      expiresIn: this.jwtSettings.accessExpiresIn,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.jwtSettings.refreshSecret,
      expiresIn: this.jwtSettings.refreshExpiresIn,
    });

    return { accessToken, refreshToken };
  }

  async logout(id: number) {
    await this.usersService.updateRefreshToken(id, null);
  }
}
