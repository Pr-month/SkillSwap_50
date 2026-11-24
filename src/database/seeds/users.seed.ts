import 'reflect-metadata';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { dbConfig } from '../../config/db.config';
import { User } from '../../users/entities/user.entity';
import { UserRole } from '../../users/users.enums';

/** Десять тестовых профилей административные права не выдаются. */
export const Users = [
  { name: 'Анна Иванова', email: 'test-user-1@example.com' },
  { name: 'Дмитрий Петров', email: 'test-user-2@example.com' },
  { name: 'Мария Соколова', email: 'test-user-3@example.com' },
  { name: 'Алексей Смирнов', email: 'test-user-4@example.com' },
  { name: 'Елена Кузнецова', email: 'test-user-5@example.com' },
  { name: 'Иван Попов', email: 'test-user-6@example.com' },
  { name: 'Ольга Васильева', email: 'test-user-7@example.com' },
  { name: 'Михаил Новиков', email: 'test-user-8@example.com' },
  { name: 'Наталья Морозова', email: 'test-user-9@example.com' },
  { name: 'Сергей Волков', email: 'test-user-10@example.com' },
];

/**
 * Добавляет недостающих тестовых пользователей в одной транзакции.
 * Сопоставляет записи по email и не меняет существующие профили и пароли.
 *
 * @param dataSource — Инициализированное подключение с готовой схемой БД.
 * @param password — Общий исходный пароль длиной от 8 символов до 72 байт UTF-8.
 * @throws Ошибка проверки пароля, хеширования или БД; вставки откатываются.
 */
export async function seedUsers(
  dataSource: DataSource,
  password: string,
): Promise<void> {
  if (password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
    throw new Error(
      'Пароль тестовых пользователей должен содержать от 8 символов до 72 байт UTF-8.',
    );
  }

  await dataSource.transaction(async (manager) => {
    const repository = manager.getRepository(User);

    for (const user of Users) {
      const existing = await repository.findOneBy({ email: user.email });
      if (existing) {
        continue;
      }

      await repository.save(
        repository.create({
          ...user,
          password: await bcrypt.hash(password, 10),
          role: UserRole.USER,
          refreshToken: null,
        }),
      );
    }
  });
}

/**
 * Загружает окружение и запускает сидинг с паролем из SEED_USERS_PASSWORD.
 * Отключает SQL-логирование и закрывает подключение после работы.
 *
 * @throws Ошибка конфигурации, подключения, сидинга или закрытия подключения.
 */
async function run(): Promise<void> {
  await ConfigModule.forRoot();
  if (!process.env.SEED_USERS_PASSWORD) {
    throw new Error('Не задан SEED_USERS_PASSWORD.');
  }
  const dataSource = new DataSource({ ...dbConfig(), logging: false });

  try {
    await dataSource.initialize();
    await seedUsers(dataSource, process.env.SEED_USERS_PASSWORD);
    console.log('Сидинг тестовых пользователей завершён.');
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

if (require.main === module) {
  void run().catch(() => {
    console.error(
      'Не удалось выполнить сидинг пользователей. Проверьте БД и SEED_USERS_PASSWORD (от 8 символов до 72 байт UTF-8).',
    );
    process.exitCode = 1;
  });
}
