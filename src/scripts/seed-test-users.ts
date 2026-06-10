import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { User } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';
import { Skill } from '../skills/entities/skill.entity';
import { testUsersData } from './seeds/users.data';

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

async function seedTestUsers() {
  await AppDataSource.initialize();
  console.log('Database connected');

  const userRepository = AppDataSource.getRepository(User);

  for (const userData of testUsersData) {
    const existing = await userRepository.findOne({
      where: { email: userData.email },
    });

    if (existing) {
      console.log(`User ${userData.email} already exists, skipping...`);
      continue;
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = userRepository.create({
      ...userData,
      password: hashedPassword,
    });

    await userRepository.save(user);
    console.log(`User created: ${userData.email}`);
  }

  await AppDataSource.destroy();
  console.log('Done!');
}

seedTestUsers().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
