import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { calculateAge } from '../common/utils/calculate-age';

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

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async updateRefreshToken(id: number, tokenHash: string | null) {
    await this.usersRepository.update(id, { refreshToken: tokenHash });
  }
}
