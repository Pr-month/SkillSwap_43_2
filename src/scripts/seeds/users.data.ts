import { Gender, Roles } from '../../users/users.enums';

export const adminData = {
  name: process.env.ADMIN_NAME ?? 'Admin',
  email: process.env.ADMIN_EMAIL ?? 'admin@skillswap.com',
  password: process.env.ADMIN_PASSWORD ?? 'admin123',
  about: 'Platform administrator',
  birthdate: '1990-01-01',
  city: 'Moscow',
  gender: Gender.UNKNOWN,
  avatar: '',
  role: Roles.ADMIN,
};

export const testUsersData = [
  {
    name: 'TestUser1',
    email: 'testuser1@skillswap.com',
    password: 'test1234',
    about: 'Test user 1 for e2e tests',
    birthdate: '1995-05-15',
    city: 'Moscow',
    gender: Gender.MALE,
    avatar: '',
    role: Roles.USER,
  },
  {
    name: 'TestUser2',
    email: 'testuser2@skillswap.com',
    password: 'test1234',
    about: 'Test user 2 for e2e tests',
    birthdate: '1998-08-20',
    city: 'Saint Petersburg',
    gender: Gender.FEMALE,
    avatar: '',
    role: Roles.USER,
  },
];
