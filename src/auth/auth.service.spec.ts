import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UserRole } from '../users/users.enums';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  const findOne = jest.fn();
  const repository = { findOne };
  const dataSource = {
    getRepository: () => repository,
  } as unknown as DataSource;

  const signAsync = jest.fn();
  const jwtService = { signAsync } as unknown as JwtService;

  const service = new AuthService(dataSource, jwtService);

  beforeEach(() => jest.clearAllMocks());

  it('пользователь не найден → 401', async () => {
    findOne.mockResolvedValue(null);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    await expect(
      service.login({ email: 'x@y.z', password: '12345678' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('неверный пароль → 401', async () => {
    findOne.mockResolvedValue({ id: 1, email: 'a@b.c', password: 'hash' });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    await expect(
      service.login({ email: 'a@b.c', password: 'wrongpass' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('успех → возвращает accessToken и user без password', async () => {
    findOne.mockResolvedValue({
      id: 1,
      email: 'a@b.c',
      name: 'Test',
      password: 'hash',
      role: UserRole.USER,
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    signAsync.mockResolvedValue('jwt.token');

    const result = await service.login({
      email: 'a@b.c',
      password: 'pass1234',
    });

    expect(result.accessToken).toBe('jwt.token');
    expect(result.user).toEqual({
      id: 1,
      email: 'a@b.c',
      name: 'Test',
      role: UserRole.USER,
    });
    expect(result.user).not.toHaveProperty('password');
  });
});
