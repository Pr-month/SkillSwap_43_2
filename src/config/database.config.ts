import { registerAs } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';
import { Skill } from '../skills/entities/skill.entity';

dotenv.config();

const options: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_DATABASE ?? 'skillswap',
  synchronize: process.env.NODE_ENV !== 'production',
  entities: [User, Category, Skill],
};

export const databaseConfig = registerAs(
  'database',
  (): DataSourceOptions => options,
);

export const AppDataSource = new DataSource(options);

export type DatabaseConfig = ReturnType<typeof databaseConfig>;
