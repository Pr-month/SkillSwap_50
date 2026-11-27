import { Test, TestingModule } from '@nestjs/testing';
import { CitiesService } from './cities.service';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { City } from './entities/city.entity';

describe('CitiesService', () => {
  let service: CitiesService;
  const deleteCity = jest.fn();

  beforeEach(async () => {
    deleteCity.mockReset();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CitiesService,
        {
          provide: getRepositoryToken(City),
          useValue: { delete: deleteCity },
        },
      ],
    }).compile();

    service = module.get<CitiesService>(CitiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('возвращает id удалённого города', async () => {
    deleteCity.mockResolvedValueOnce({ affected: 1 });

    await expect(service.remove(1)).resolves.toEqual({ id: 1 });
    expect(deleteCity).toHaveBeenCalledWith({ id: 1 });
  });

  it('возвращает ошибку, если город не найден', async () => {
    deleteCity.mockResolvedValueOnce({ affected: 0 });

    await expect(service.remove(1)).rejects.toThrow(NotFoundException);
  });
});
