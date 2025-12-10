import 'reflect-metadata';
import request from 'supertest';
import { Application } from '../../../core/application';
import { AppModule } from '../../../app.module';

describe('AuthController', () => {
  let app: Application;
  let server: any;

  beforeAll(async () => {
    app = new Application(AppModule);
    server = app['app']; // Access express app directly for supertest
  });

  it('should register a new user', async () => {
    const uniqueEmail = `test-${Date.now()}@example.com`;
    const response = await request(server)
      .post('/auth/register')
      .send({
        email: uniqueEmail,
        password: 'password123',
        name: 'Test User',
      });

    if (response.status !== 200) {
      console.log('Register error response:', response.body);
    }
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body.email).toBe(uniqueEmail);
  });

  it('should login with valid credentials', async () => {
    const uniqueEmail = `test-login-${Date.now()}@example.com`;
    // Register first
    await request(server)
      .post('/auth/register')
      .send({
        email: uniqueEmail,
        password: 'password123',
        name: 'Test User',
      });

    const response = await request(server)
      .post('/auth/login')
      .send({
        email: uniqueEmail,
        password: 'password123',
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.headers['set-cookie']).toBeDefined();
  });

  it('should fail login with invalid credentials', async () => {
    const response = await request(server)
      .post('/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'wrongpassword',
      });

    expect(response.status).toBe(401);
  });
});
