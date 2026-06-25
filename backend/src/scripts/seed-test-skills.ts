import { AppDataSource } from '../config/database.config';
import { User } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';
import { Skill } from '../skills/entities/skill.entity';
import { testUsersData } from './seeds/users.data';

async function seedTestSkills() {
  await AppDataSource.initialize();
  console.log('Database connected');

  const userRepository = AppDataSource.getRepository(User);
  const categoryRepository = AppDataSource.getRepository(Category);
  const skillRepository = AppDataSource.getRepository(Skill);

  const user1 = await userRepository.findOne({
    where: { email: testUsersData[0].email },
  });
  const user2 = await userRepository.findOne({
    where: { email: testUsersData[1].email },
  });

  if (!user1 || !user2) {
    console.error('Test users not found! Run "npm run seed:test:users" first.');
    process.exit(1);
  }

  const catFrontend = await categoryRepository.findOne({
    where: { name: 'Frontend' },
  });
  const catGuitar = await categoryRepository.findOne({
    where: { name: 'Гитара' },
  });

  if (!catFrontend || !catGuitar) {
    console.error('Categories not found! Run "npm run seed:categories" first.');
    process.exit(1);
  }

  const testSkills = [
    {
      title: 'Основы React и TypeScript',
      description: 'Научу собирать базовые SPA приложения на React',
      category: catFrontend,
      owner: user1,
      images: [],
    },
    {
      title: 'Игра на акустической гитаре',
      description: 'Покажу базовые аккорды и бой',
      category: catGuitar,
      owner: user2,
      images: [],
    },
  ];

  for (const skillData of testSkills) {
    const existing = await skillRepository.findOne({
      where: { title: skillData.title },
    });

    if (!existing) {
      const skill = skillRepository.create(skillData);
      await skillRepository.save(skill);
      console.log(`Skill created: ${skill.title}`);
    } else {
      console.log(`Skill already exists: ${skillData.title}`);
    }
  }

  await AppDataSource.destroy();
  console.log('Skills seeding done!');
}

seedTestSkills().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
