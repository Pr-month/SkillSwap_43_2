import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { User } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';
import { Skill } from '../skills/entities/skill.entity';
import { adminData } from './seeds/users.data';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_DATABASE ?? 'skillswap',
  synchronize: false,
  entities: [User, Category, Skill],
});

async function seedAdmin() {
  await AppDataSource.initialize();
  console.log('Database connected');

  const userRepository = AppDataSource.getRepository(User);

  const existing = await userRepository.findOne({
    where: { email: adminData.email },
  });

  if (existing) {
    console.log('Admin already exists, skipping...');
    await AppDataSource.destroy();
    return;
  }

  const hashedPassword = await bcrypt.hash(adminData.password, 10);

  const admin = userRepository.create({
    ...adminData,
    password: hashedPassword,
  });

  await userRepository.save(admin);
  console.log(`Admin created: ${adminData.email}`);

  await AppDataSource.destroy();
  console.log('Done!');
}

seedAdmin().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
