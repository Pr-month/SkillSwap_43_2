import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';

describe('Auth E2E', () => {
  let app: INestApplication;

  const registerDto = {
    name: 'Dima',
    email: 'test@mail.com',
    password: '123456',
    wantToLearn: ['nestjs'],
    birthdate: '2000-01-01',
    about: 'test',
    gender: 'male',
    avatar: 'avatar.jpg',
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should register user', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(registerDto);

    expect(response.status).toBe(201);

    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
  });

  it('should return 409 for existing email', async () => {
    await request(app.getHttpServer()).post('/auth/register').send(registerDto);

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(registerDto);

    expect(response.status).toBe(409);
  });

  it('should login user', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: registerDto.email,
        password: registerDto.password,
      });

    expect(response.status).toBe(200);

    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
  });

  it('should return 401 for wrong password', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: registerDto.email,
        password: 'wrongpassword',
      });

    expect(response.status).toBe(401);
  });

  it('should logout user', async () => {
    const login = await request(app.getHttpServer()).post('/auth/login').send({
      email: registerDto.email,
      password: registerDto.password,
    });

    const token = login.body.accessToken;

    const response = await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body.message).toBe('Logged out successfully');
  });

  it('should deny logout without token', async () => {
    const response = await request(app.getHttpServer()).post('/auth/logout');

    expect(response.status).toBe(401);
  });
});
