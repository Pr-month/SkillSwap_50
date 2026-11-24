import 'reflect-metadata';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { isEmail } from 'class-validator';
import * as bcrypt from 'bcrypt';
import { dbConfig } from '../../config/db.config';
import { User } from '../../users/entities/user.entity';
import { UserRole } from '../../users/users.enums';

/**
 * Создаёт администратора в транзакции, сохраняя существующую запись админа.
 * При совпадении email с обычным пользователем завершает работу с ошибкой.
 *
 * @param dataSource — Инициализированное подключение с готовой схемой БД.
 * @param email — Email администратора длиной не более 255 символов.
 * @param password — Исходный пароль длиной от 8 символов до 72 байт UTF-8.
 * @throws Ошибка конфигурации, конфликт роли, ошибка хеширования или БД.
 */
export async function seedAdmin(
  dataSource: DataSource,
  email: string,
  password: string,
): Promise<void> {
  if (email.length > 255 || !isEmail(email)) {
    throw new Error('Некорректный ADMIN_EMAIL.');
  }
  if (password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
    throw new Error(
      'ADMIN_PASSWORD должен содержать от 8 символов до 72 байт UTF-8.',
    );
  }

  await dataSource.transaction(async (manager) => {
    const repository = manager.getRepository(User);
    const existing = await repository.findOneBy({ email });
    if (existing) {
      if (existing.role !== UserRole.ADMIN) {
        throw new Error(
          'Email администратора занят пользователем с другой ролью.',
        );
      }
      return;
    }

    await repository.save(
      repository.create({
        name: 'Администратор',
        email,
        password: await bcrypt.hash(password, 10),
        role: UserRole.ADMIN,
        refreshToken: null,
      }),
    );
  });
}

/**
 * Загружает ADMIN_EMAIL и ADMIN_PASSWORD из окружения и запускает сидинг.
 * Отключает SQL-логирование и закрывает подключение после работы.
 *
 * @throws Ошибка конфигурации, подключения, сидинга или закрытия подключения.
 */
async function run(): Promise<void> {
  await ConfigModule.forRoot();
  const email = process.env.ADMIN_EMAIL ?? '';
  const password = process.env.ADMIN_PASSWORD ?? '';
  if (!email || !password) {
    throw new Error('Задайте ADMIN_EMAIL и ADMIN_PASSWORD.');
  }
  const dataSource = new DataSource({ ...dbConfig(), logging: false });

  try {
    await dataSource.initialize();
    await seedAdmin(dataSource, email, password);
    console.log('Сидинг администратора завершён.');
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

if (require.main === module) {
  void run().catch(() => {
    console.error(
      'Не удалось выполнить сидинг администратора. Проверьте ADMIN_EMAIL, ADMIN_PASSWORD, подключение и отсутствие конфликта роли.',
    );
    process.exitCode = 1;
  });
}
