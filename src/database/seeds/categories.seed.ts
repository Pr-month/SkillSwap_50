import 'reflect-metadata';
import { ConfigModule } from '@nestjs/config';
import { dbConfig } from '../../config/db.config';
import { DataSource, IsNull } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';

/** Исходные данные задачи #88: названия родителей и их дочерних категорий. */
export const Categories = [
  {
    name: 'Творчество и искусство',
    children: [
      'Управление командой',
      'Маркетинг и реклама',
      'Продажи и переговоры',
      'Личный бренд',
      'Резюме и собеседование',
      'Тайм-менеджмент',
      'Проектное управление',
      'Предпринимательство',
    ],
  },
  {
    name: 'IT и программирование',
    children: [
      'Frontend',
      'Backend',
      'DevOps',
      'Мобильная разработка',
      'GameDev',
    ],
  },
  {
    name: 'Дизайн и UX/UI',
    children: ['Графический дизайн', 'UX/UI', 'Motion-дизайн', 'Web-дизайн'],
  },
  {
    name: 'Финансы и бухгалтерия',
    children: [
      'Личная финансовая грамотность',
      'Бухгалтерия и налоги',
      'Инвестиции',
    ],
  },
  {
    name: 'Маркетинг и продажи',
    children: ['Таргетинг', 'Контекстная реклама', 'SEO', 'Email-маркетинг'],
  },
  {
    name: 'Образование и обучение',
    children: ['Методика преподавания', 'Онлайн-курсы', 'Педагогика'],
  },
  {
    name: 'Языки',
    children: [
      'Английский язык',
      'Немецкий язык',
      'Французский язык',
      'Испанский язык',
      'Китайский язык',
      'Русский язык',
    ],
  },
  {
    name: 'Музыкальные инструменты',
    children: [
      'Гитара',
      'Фортепиано',
      'Скрипка',
      'Ударные',
      'Вокал',
      'Бас-гитара',
      'Саксофон',
    ],
  },
];

/**
 * Добавляет недостающие категории и подкатегории в одной транзакции.
 * Повторный последовательный запуск сохраняет существующие записи и их ID.
 * Категории сопоставляются по имени и родителю.
 *
 * @param dataSource — Инициализированное подключение TypeORM с готовой схемой БД.
 * @throws Ошибка операции БД; все вставки текущего запуска откатываются.
 */
export async function seedCategories(dataSource: DataSource): Promise<void> {
  await dataSource.transaction(async (manager) => {
    const repository = manager.getRepository(Category);

    for (const { name, children } of Categories) {
      let parent = await repository.findOneBy({ name, parent: IsNull() });
      if (!parent) {
        parent = await repository.save(
          repository.create({ name, parent: null }),
        );
      }

      for (const childName of children) {
        const child = await repository.findOneBy({
          name: childName,
          parent: { id: parent.id },
        });
        if (!child) {
          await repository.save(repository.create({ name: childName, parent }));
        }
      }
    }
  });
}

/**
 * Загружает настройки окружения, открывает подключение и запускает сидинг.
 * После работы закрывает подключение, в том числе при ошибке сидинга.
 *
 * @throws Ошибка настройки, подключения, сидинга или закрытия подключения.
 */
async function run(): Promise<void> {
  await ConfigModule.forRoot();
  const dataSource = new DataSource(dbConfig());

  try {
    await dataSource.initialize();
    await seedCategories(dataSource);
    console.log('Сидинг категорий завершён.');
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

if (require.main === module) {
  void run().catch(() => {
    console.error(
      'Не удалось выполнить сидинг категорий. Проверьте подключение и схему БД.',
    );
    process.exitCode = 1;
  });
}
