import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../config/database.config';
import { User } from '../users/entities/user.entity';
import { testUsersData } from './seeds/users.data';

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
