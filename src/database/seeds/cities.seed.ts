import 'reflect-metadata';
import { readFileSync } from 'node:fs';
import { DataSource } from 'typeorm';
import { City } from '../../cities/entities/city.entity';
import { ConfigModule } from '@nestjs/config';
import { dbConfig } from '../../config/db.config';

export function readCityNames(filePath: string): string[] {
  const data: unknown = JSON.parse(readFileSync(filePath, 'utf8'));

  if (!Array.isArray(data)) {
    throw new Error('Ожидался JSON-массив городов');
  }

  const names = new Set<string>();

  for (const [index, city] of data.entries()) {
    const row: unknown = city;

    if (
      typeof row !== 'object' ||
      row === null ||
      !('name' in row) ||
      typeof row.name !== 'string' ||
      !row.name.trim()
    ) {
      throw new Error(`У записи ${index + 1} отсутствует название города`);
    }

    names.add(row.name.trim());
  }

  return [...names];
}
export async function seedCities(
  dataSource: DataSource,
  filePath: string,
): Promise<void> {
  const names = readCityNames(filePath);

  if (names.length === 0) {
    return;
  }

  await dataSource
    .getRepository(City)
    .createQueryBuilder()
    .insert()
    .into(City)
    .values(names.map((name) => ({ name })))
    .orIgnore()
    .execute();
}

async function run(): Promise<void> {
  const filePath = process.argv[2];

  if (!filePath) {
    throw new Error('Укажи путь к JSON-файлу с городами');
  }

  await ConfigModule.forRoot();
  const dataSource = new DataSource({ ...dbConfig(), synchronize: false });

  try {
    await dataSource.initialize();
    await seedCities(dataSource, filePath);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }

  console.log('Сидинг городов завершён.');
}

if (require.main === module) {
  void run().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
