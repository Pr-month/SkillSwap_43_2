import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';

describe('Skills E2E', () => {
  let app: INestApplication;
  let accessToken: string;

  const registerDto = {
    name: 'SkillUser',
    email: 'skilluser@mail.com',
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

    await request(app.getHttpServer()).post('/auth/register').send(registerDto);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return list of skills', async () => {
    const response = await request(app.getHttpServer()).get('/skills');
    expect(response.status).toBe(200);
  });

  it('should return 401 for create without token', async () => {
    const response = await request(app.getHttpServer())
      .post('/skills')
      .send({});
    expect(response.status).toBe(401);
  });

  it('should return 401 for update without token', async () => {
    const response = await request(app.getHttpServer())
      .patch('/skills/some-id')
      .send({});
    expect(response.status).toBe(401);
  });

  it('should return 401 for delete without token', async () => {
    const response = await request(app.getHttpServer()).delete(
      '/skills/some-id',
    );
    expect(response.status).toBe(401);
  });

  it('should return 401 for add to favorites without token', async () => {
    const response = await request(app.getHttpServer()).patch(
      '/skills/favorites/some-id',
    );
    expect(response.status).toBe(401);
  });

  it('should return 401 for remove from favorites without token', async () => {
    const response = await request(app.getHttpServer()).delete(
      '/skills/favorites/some-id',
    );
    expect(response.status).toBe(401);
  });
});
