import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { calculateAge } from '../common/utils/calculate-age';
import { UpdatePasswordDto } from './dto/update-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}
  async create(createUserDto: CreateUserDto): Promise<User> {
    const newUser = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(newUser);
  }

  async findAll() {
    const users = await this.usersRepository.find({
      select: {
        id: true,
        name: true,
        about: true,
        birthdate: true,
        city: true,
        gender: true,
        avatar: true,
      },
      order: { id: 'ASC' },
    });
    return users.map((user) => ({
      id: user.id,
      name: user.name,
      about: user.about,
      city: user.city,
      gender: user.gender,
      avatar: user.avatar,
      age: calculateAge(user.birthdate),
    }));
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.usersRepository.findOneBy({ email });
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const updatedUser = { ...user, ...updateUserDto };

    return this.usersRepository.save(updatedUser);
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async updateRefreshToken(id: number, tokenHash: string | null) {
    await this.usersRepository.update(id, { refreshToken: tokenHash });
  }

  async updatePassword(
    id: number,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<void> {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const isMatch = await bcrypt.compare(
      updatePasswordDto.currentPassword,
      user.password,
    );

    if (!isMatch) {
      throw new BadRequestException('Введен неверный пароль');
    }

    const updatedPassword = await bcrypt.hash(
      updatePasswordDto.newPassword,
      10,
    );

    const updatedUser = { ...user, password: updatedPassword };

    await this.usersRepository.save(updatedUser);
  }
}
