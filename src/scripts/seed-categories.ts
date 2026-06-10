import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';
import { Skill } from '../skills/entities/skill.entity';
import { categoriesData } from './seeds/categories.data';

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

async function seedCategories() {
  await AppDataSource.initialize();
  console.log('Database connected');

  const categoryRepository = AppDataSource.getRepository(Category);

  for (const group of categoriesData) {
    let parent = await categoryRepository.findOne({
      where: { name: group.name },
    });

    if (!parent) {
      parent = categoryRepository.create({ name: group.name });
      parent = await categoryRepository.save(parent);
      console.log(`Parent category created: ${parent.name}`);
    }

    for (const childName of group.children) {
      const existingChild = await categoryRepository.findOne({
        where: { name: childName },
      });

      if (!existingChild) {
        const child = categoryRepository.create({
          name: childName,
          parent: parent,
        });
        await categoryRepository.save(child);
        console.log(` -- Child category created: ${childName}`);
      }
    }
  }

  await AppDataSource.destroy();
  console.log('Categories seeding done!');
}

seedCategories().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
