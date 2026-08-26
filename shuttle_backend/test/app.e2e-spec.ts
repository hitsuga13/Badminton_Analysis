import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { afterEach, beforeEach, describe, it } from '@jest/globals';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('PlayersController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/players (GET)', () => {
    return request(app.getHttpServer())
      .get('/players')
      .expect(200)
      .expect((response) => {
        expect(Array.isArray(response.body)).toBe(true);
      });
  });

  it('/players (POST)', () => {
    return request(app.getHttpServer())
      .post('/players')
      .send({
        name: 'Test Player',
        category: 'singles',
        hand: 'right',
        age: 20,
        heightCm: 175,
        weightKg: 65,
        form: [0, 1, 0],
      })
      .expect(201)
      .expect((response) => {
        expect(response.body.name).toBe('Test Player');
        expect(response.body.category).toBe('singles');
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
