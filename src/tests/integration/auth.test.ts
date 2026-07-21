import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { prisma } from '../../config/db.js';

describe('Auth routes', () => {
  const testUser = {
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'password123',
  };

  beforeAll(async () => {
    await prisma.$connect();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany({ where: { email: testUser.email } })
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testUser.email } })
    await prisma.$disconnect();
  });

  describe('POST /auth/register', () => {
    it('registers a new user and returns a token', async () => {
      const res = await request(app).post('/auth/register').send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.password).toBeUndefined(); // never leak the hash
    });

    it('rejects duplicate email registration', async () => {
      await request(app).post('/auth/register').send(testUser);
      const res = await request(app).post('/auth/register').send(testUser);

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/already exists/i);
    });

    it('rejects a payload that fails validation', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ name: 'A', email: 'bad-email', password: '123' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/auth/register').send(testUser);
    });

    it('logs in with correct credentials', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      expect(res.status).toBe(200);
      expect(res.body.data.token).toBeDefined();
    });

    it('rejects an incorrect password', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: testUser.email, password: 'wrongpassword' });

      expect(res.status).toBe(401);
    });

    it('rejects a non-existent email', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'nouser@example.com', password: testUser.password });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('clears the jwt cookie', async () => {
      const res = await request(app).post('/auth/logout');

      expect(res.status).toBe(200);
      expect(res.headers['set-cookie']?.[0]).toMatch(/jwt=;/);
    });
  });
});