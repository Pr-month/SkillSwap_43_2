import { AppDataSource } from '../config/database.config';
import { Category } from '../categories/entities/category.entity';
import { categoriesData } from './seeds/categories.data';

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
