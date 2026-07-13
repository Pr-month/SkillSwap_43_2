import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';

describe('Cities E2E', () => {
  let app: INestApplication;

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

  it('should return list of cities', async () => {
    const response = await request(app.getHttpServer()).get('/cities');
    expect(response.status).toBe(200);
  });

  it('should return 401 for POST /cities without token', async () => {
    const response = await request(app.getHttpServer())
      .post('/cities')
      .send({ name: 'Test City' });
    expect(response.status).toBe(401);
  });

  it('should return 401 for PATCH /cities/:id without token', async () => {
    const response = await request(app.getHttpServer())
      .patch('/cities/some-id')
      .send({ name: 'Test City' });
    expect(response.status).toBe(401);
  });

  it('should return 401 for DELETE /cities/:id without token', async () => {
    const response = await request(app.getHttpServer()).delete(
      '/cities/some-id',
    );
    expect(response.status).toBe(401);
  });
});
