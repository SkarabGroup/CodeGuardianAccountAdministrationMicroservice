import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { Pool } from 'pg';

jest.setTimeout(15000);

// --- INTERFACCE PER TIPIZZARE RIGOROSAMENTE LE RISPOSTE HTTP ---
// Questo impedisce a ESLint di lamentarsi del tipo 'any' su response.body

interface AuthResponseBody {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
  };
}

interface DeleteResponseBody {
  deleted: boolean;
}

// Estraiamo il tipo esatto che Supertest si aspetta, senza usare 'any'
type SupertestApp = Parameters<typeof request>[0];

describe('Authentication Flow (e2e)', () => {
  let app: INestApplication;
  let dbPool: Pool;
  let server: SupertestApp; // Tipizzazione rigorosa del server

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );

    await app.init();

    // Cast sicuro al tipo richiesto da Supertest
    server = app.getHttpServer() as unknown as SupertestApp;

    // Connessione diretta al DB per la pulizia
    dbPool = new Pool({
      connectionString:
        process.env.DATABASE_URL || 'postgres://root:root@localhost:5432/miodb',
    });
  });

  afterAll(async () => {
    if (app) await app.close();
    if (dbPool) await dbPool.end();
  });

  beforeEach(async () => {
    await dbPool.query('TRUNCATE TABLE users, sessions CASCADE');
    jest.clearAllMocks();
  });

  // --- I TEST PRECEDENTI ---

  it('Dovrebbe bloccare una registrazione con password debole (Test ValidationPipe)', async () => {
    const response = await request(server)
      .post('/account/auth/register')
      .send({ email: 'test@example.com', password: '123' });

    expect(response.status).toBe(400);
  });

  it('Dovrebbe completare il flusso completo: Registrazione -> Login', async () => {
    const userCredentials = {
      email: 'e2e@example.com',
      password: 'StrongPassword123!',
    };

    const registerResponse = await request(server)
      .post('/account/auth/register')
      .send(userCredentials);

    expect(registerResponse.status).toBe(201);

    const loginResponse = await request(server)
      .post('/account/auth/login')
      .send(userCredentials);

    expect([200, 201]).toContain(loginResponse.status);

    // Castiamo il body in modo sicuro
    const loginBody = loginResponse.body as AuthResponseBody;
    expect(loginBody.accessToken).toBeDefined();
    expect(loginBody.refreshToken).toBeDefined();
  });

  it('Dovrebbe rifiutare il login con password errata', async () => {
    await request(server)
      .post('/account/auth/register')
      .send({ email: 'wrong@example.com', password: 'StrongPassword123!' });

    const loginResponse = await request(server)
      .post('/account/auth/login')
      .send({ email: 'wrong@example.com', password: 'WrongPassword999!' });

    expect([400, 401, 500]).toContain(loginResponse.status);
  });

  // --- I TEST DELL'UPDATE E LOGOUT ---

  it('Dovrebbe permettere a un utente di aggiornare la propria password in modo sicuro (UpdateController)', async () => {
    const registerResponse = await request(server).post('/account/auth/register').send({
      email: 'update-secure@example.com',
      password: 'OldPassword123!',
    });

    const registerBody = registerResponse.body as AuthResponseBody;
    const accessToken = registerBody.accessToken;

    expect(accessToken).toBeDefined();

    const updateResponse = await request(server)
      .patch('/account/auth/update')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ newPassword: 'NewPassword999!' });

    expect([200, 201]).toContain(updateResponse.status);

    const updateBody = updateResponse.body as AuthResponseBody;
    expect(updateBody.accessToken).toBeDefined();
    expect(updateBody.user.email).toBe('update-secure@example.com');

    const loginResponse = await request(server).post('/account/auth/login').send({
      email: 'update-secure@example.com',
      password: 'NewPassword999!',
    });

    expect([200, 201]).toContain(loginResponse.status);
  });

  it('Dovrebbe eliminare la sessione al momento del logout (LogoutService)', async () => {
    await request(server)
      .post('/account/auth/register')
      .send({ email: 'logout@example.com', password: 'StrongPassword123!' });

    const loginResponse = await request(server)
      .post('/account/auth/login')
      .send({ email: 'logout@example.com', password: 'StrongPassword123!' });

    const loginBody = loginResponse.body as AuthResponseBody;
    const refreshToken = loginBody.refreshToken;

    const logoutResponse = await request(server)
      .post('/account/auth/logout')
      .send({ refreshToken: refreshToken });

    expect([200, 201, 204]).toContain(logoutResponse.status);

    const sessionCheck = await dbPool.query(
      'SELECT * FROM sessions WHERE refresh_token = $1',
      [refreshToken],
    );
    expect(sessionCheck.rows.length).toBe(0);
  });

  it("Dovrebbe eliminare un utente con successo estraendo l'ID dal Token (DeleteUserController)", async () => {
    const registerResponse = await request(server)
      .post('/account/auth/register')
      .send({ email: 'delete-me@example.com', password: 'StrongPassword123!' });

    const registerBody = registerResponse.body as AuthResponseBody;
    const accessToken = registerBody.accessToken;

    expect(accessToken).toBeDefined();

    const deleteResponse = await request(server)
      .delete('/account/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send();

    expect([200, 201, 204]).toContain(deleteResponse.status);

    const deleteBody = deleteResponse.body as DeleteResponseBody;
    expect(deleteBody.deleted).toBe(true);

    const loginResponse = await request(server)
      .post('/account/auth/login')
      .send({ email: 'delete-me@example.com', password: 'StrongPassword123!' });

    expect([400, 401, 404, 500]).toContain(loginResponse.status);
  });

  // --- TEST DEI CASI LIMITE E SICUREZZA (UNHAPPY PATHS) ---

  it("Dovrebbe impedire la registrazione se l'email è già in uso", async () => {
    const user = { email: 'clone@example.com', password: 'StrongPassword123!' };

    await request(server).post('/account/auth/register').send(user).expect(201);

    const duplicateResponse = await request(server)
      .post('/account/auth/register')
      .send(user);

    expect([400, 409, 500]).toContain(duplicateResponse.status);
  });

  it("Dovrebbe rifiutare il login se l'email non esiste nel database", async () => {
    const loginResponse = await request(server)
      .post('/account/auth/login')
      .send({ email: 'fantasma@example.com', password: 'StrongPassword123!' });

    expect([400, 401, 404, 500]).toContain(loginResponse.status);
  });

  it("Dovrebbe bloccare l'eliminazione dell'utente se non viene fornito il Token JWT (Sicurezza)", async () => {
    const deleteResponse = await request(server).delete('/account/users/me').send();

    expect(deleteResponse.status).toBe(401);
  });
});
