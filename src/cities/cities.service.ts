import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { City } from './entities/city.entity';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { FindCitiesQueryDto } from './dto/find-cities-query.dto';

const MAX_CITIES = 10;

@Injectable()
export class CitiesService {
  constructor(
    @InjectRepository(City)
    private readonly citiesRepository: Repository<City>,
  ) {}

  create(createCityDto: CreateCityDto) {
    return 'This action adds a new city';
  }

  findAll(query: FindCitiesQueryDto): Promise<City[]> {
    const where = query.search ? { name: ILike(`%${query.search}%`) } : {};

    return this.citiesRepository.find({
      where,
      order: { name: 'ASC' },
      take: MAX_CITIES,
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} city`;
  }

  update(id: number, updateCityDto: UpdateCityDto) {
    return `This action updates a #${id} city`;
  }

  remove(id: number) {
    return `This action removes a #${id} city`;
  }
}
