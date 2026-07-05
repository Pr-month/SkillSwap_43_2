import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';

describe('Requests E2E', () => {
  let app: INestApplication;
  let accessToken: string;
  const registerDto = {
    name: 'Sender',
    email: 'sender@mail.com',
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

  it('should return 401 for incoming without token', async () => {
    const response = await request(app.getHttpServer()).get(
      '/requests/incoming',
    );
    expect(response.status).toBe(401);
  });

  it('should return incoming requests for authorized user', async () => {
    const response = await request(app.getHttpServer())
      .get('/requests/incoming')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should return 401 for outgoing without token', async () => {
    const response = await request(app.getHttpServer()).get(
      '/requests/outgoing',
    );
    expect(response.status).toBe(401);
  });

  it('should return outgoing requests for authorized user', async () => {
    const response = await request(app.getHttpServer())
      .get('/requests/outgoing')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should return 401 for create without token', async () => {
    const response = await request(app.getHttpServer())
      .post('/requests')
      .send({});
    expect(response.status).toBe(401);
  });

  it('should return 401 for delete without token', async () => {
    const response = await request(app.getHttpServer()).delete(
      '/requests/some-id',
    );
    expect(response.status).toBe(401);
  });
});
