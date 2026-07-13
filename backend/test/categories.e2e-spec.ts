import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';

describe('Categories E2E', () => {
  let app: INestApplication;
  let adminToken: string;

  const adminDto = {
    email: process.env.ADMIN_EMAIL ?? 'admin@mail.com',
    password: process.env.ADMIN_PASSWORD ?? 'admin123',
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send(adminDto);

    adminToken = login.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return list of categories', async () => {
    const response = await request(app.getHttpServer()).get('/categories');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should return 401 for POST /categories without token', async () => {
    const response = await request(app.getHttpServer())
      .post('/categories')
      .send({ name: 'Test' });
    expect(response.status).toBe(401);
  });

  it('should return 401 for PATCH /categories/:id without token', async () => {
    const response = await request(app.getHttpServer())
      .patch('/categories/some-id')
      .send({ name: 'Test' });
    expect(response.status).toBe(401);
  });

  it('should return 401 for DELETE /categories/:id without token', async () => {
    const response = await request(app.getHttpServer()).delete(
      '/categories/some-id',
    );
    expect(response.status).toBe(401);
  });

  it('should create category as admin', async () => {
    const response = await request(app.getHttpServer())
      .post('/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Test Category' });
    expect(response.status).toBe(201);
    expect(response.body.name).toBe('Test Category');
  });
});
