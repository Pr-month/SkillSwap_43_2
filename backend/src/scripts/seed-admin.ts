import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../config/database.config';
import { User } from '../users/entities/user.entity';
import { adminData } from './seeds/users.data';

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
