import { registerAs, ConfigType } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';

export const dbConfig = registerAs(
  'DB_CONFIG',
  (): DataSourceOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER || 'skillswap_app',
    password: process.env.DB_PASSWORD || 'skillswap',
    database: process.env.DB_NAME || 'skillswap',
    synchronize:
      process.env.NODE_ENV !== 'production' &&
      process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.DB_LOGGING === 'true',
    migrations: ['dist/migrations/*.js'],
    entities: [__dirname + '/../**/*.entity.{ts,js}'],
  }),
);

export type TDbConfig = ConfigType<typeof dbConfig>;
