import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { Pool } from 'pg';

jest.setTimeout(15000);

// Interfacce per tipizzare le response
interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user?: { email: string };
}

interface ErrorResponse {
  message: string | string[];
  statusCode: number;
  error: string;
}

describe('Authentication Flow (e2e)', () => {
  let app: INestApplication;
  let dbPool: Pool;

  beforeAll(async () => {
    console.log('[DEBUG] 1. Inizio creazione modulo NestJS...');
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    console.log('[DEBUG] 2. Modulo compilato, avvio applicazione...');
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();

    console.log('[DEBUG] 3. Applicazione avviata. Tento connessione al DB...');
    dbPool = new Pool({
      connectionString: 'postgres://root:root@localhost:5432/miodb',
    });

    try {
      console.log('[DEBUG] 4. Ping al DB...');
      await dbPool.query('SELECT 1');
      console.log('[DEBUG] 5. Connessione al DB stabilita.');
    } catch (error) {
      console.error('[DEBUG-ERRORE] FALLITA LA CONNESSIONE AL DB!', error);
    }
  });

  beforeEach(async () => {
    console.log('[DEBUG] 6. Svuotamento tabella users...');
    try {
      await dbPool.query('TRUNCATE TABLE users CASCADE');
      console.log('[DEBUG] 7. Tabella svuotata.');
    } catch (error) {
      console.error('[DEBUG-ERRORE] IMPOSSIBILE SVUOTARE LA TABELLA.', error);
    }
    jest.clearAllMocks();
  });

  afterAll(async () => {
    if (app) await app.close();
    if (dbPool) await dbPool.end();
  });

  it('Dovrebbe bloccare una registrazione con password debole (Test ValidationPipe)', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'test@example.com', password: '123' });

    const body = response.body as ErrorResponse;

    expect(response.status).toBe(400);
    expect(body.message).toBeInstanceOf(Array);
  });

  it('Dovrebbe completare il flusso completo: Registrazione -> Login', async () => {
    const userCredentials = {
      email: 'e2e@example.com',
      password: 'StrongPassword123!',
    };

    // Step A: Registrazione
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send(userCredentials);

    const registerBody = registerResponse.body as AuthResponse;

    expect(registerResponse.status).toBe(201);
    expect(registerBody.accessToken).toBeDefined();

    // Step B: Login
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send(userCredentials);

    const loginBody = loginResponse.body as AuthResponse;

    expect(loginResponse.status).toBe(200);
    expect(loginBody.accessToken).toBeDefined();
    expect(loginBody.refreshToken).toBeDefined();
    expect(loginBody.user?.email).toBe(userCredentials.email);
  });

  it('Dovrebbe rifiutare il login con password errata', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'wrong@example.com', password: 'StrongPassword123!' });

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'wrong@example.com', password: 'WrongPassword999!' });

    expect([401, 500]).toContain(loginResponse.status);
  });
});