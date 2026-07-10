import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';

describe('Users E2E', () => {
  let app: INestApplication;
  let accessToken: string;

  const registerDto = {
    name: 'TestUser',
    email: 'testuser@mail.com',
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

    const login = await request(app.getHttpServer())
      .post('/auth/register')
      .send(registerDto);

    accessToken = login.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 401 for GET /users/me without token', async () => {
    const response = await request(app.getHttpServer()).get('/users/me');
    expect(response.status).toBe(401);
  });

  it('should return current user for GET /users/me with token', async () => {
    const response = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(response.status).toBe(200);
    expect(response.body.email).toBe(registerDto.email);
  });

  it('should return user by id', async () => {
    const me = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${accessToken}`);
    const response = await request(app.getHttpServer()).get(
      `/users/${me.body.id}`,
    );
    expect(response.status).toBe(200);
  });

  it('should return 401 for PATCH /users/me without token', async () => {
    const response = await request(app.getHttpServer())
      .patch('/users/me')
      .send({ name: 'NewName' });
    expect(response.status).toBe(401);
  });

  it('should update current user', async () => {
    const response = await request(app.getHttpServer())
      .patch('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'UpdatedName' });
    expect(response.status).toBe(200);
  });

  it('should return 401 for PATCH /users/me/password without token', async () => {
    const response = await request(app.getHttpServer())
      .patch('/users/me/password')
      .send({});
    expect(response.status).toBe(401);
  });
});
