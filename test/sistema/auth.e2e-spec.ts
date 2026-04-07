import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { Pool } from 'pg';

jest.setTimeout(15000);

describe('Authentication Flow (e2e)', () => {
  let app: INestApplication;
  let dbPool: Pool;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    
    await app.init();

    // Connessione diretta al DB per la pulizia
    dbPool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgres://root:root@localhost:5432/miodb',
    });
  });

  afterAll(async () => {
    if (app) await app.close();
    if (dbPool) await dbPool.end();
  });

  beforeEach(async () => {
    // Aggiunto CASCADE per pulire sia users che la nuova tabella sessions!
    await dbPool.query('TRUNCATE TABLE users, sessions CASCADE');
    jest.clearAllMocks();
  });

  // --- I TEST PRECEDENTI ---

  it('Dovrebbe bloccare una registrazione con password debole (Test ValidationPipe)', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'test@example.com', password: '123' });

    expect(response.status).toBe(400);
  });

  it('Dovrebbe completare il flusso completo: Registrazione -> Login', async () => {
    const userCredentials = { email: 'e2e@example.com', password: 'StrongPassword123!' };

    // Registrazione
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send(userCredentials);

    // NestJS restituisce 201 di default per le POST
    expect(registerResponse.status).toBe(201); 

    // Login
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send(userCredentials);

    expect([200, 201]).toContain(loginResponse.status);
    expect(loginResponse.body.accessToken).toBeDefined();
    expect(loginResponse.body.refreshToken).toBeDefined();
  });

  it('Dovrebbe rifiutare il login con password errata', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'wrong@example.com', password: 'StrongPassword123!' });

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'wrong@example.com', password: 'WrongPassword999!' });

    expect([400, 401, 500]).toContain(loginResponse.status);
  });

  // --- I NUOVI TEST ---

it('Dovrebbe permettere a un utente di aggiornare la propria password in modo sicuro (UpdateController)', async () => {
    // 1. Creiamo un utente
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'update-secure@example.com', password: 'OldPassword123!' });

    // Estraiamo il token generato dalla registrazione
    const accessToken = registerResponse.body.accessToken;
    expect(accessToken).toBeDefined();

    // 2. Chiamiamo l'endpoint di update (passando il token e SOLO la nuova password)
    const updateResponse = await request(app.getHttpServer())
      .patch('/auth/update') 
      .set('Authorization', `Bearer ${accessToken}`) // <-- L'hacker non può falsificare questo!
      .send({ newPassword: 'NewPassword999!' });     // <-- Email rimossa dal body

    expect([200, 201]).toContain(updateResponse.status);
    expect(updateResponse.body.accessToken).toBeDefined();
    expect(updateResponse.body.user.email).toBe('update-secure@example.com');

    // 3. Verifichiamo che la nuova password funzioni facendo login
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'update-secure@example.com', password: 'NewPassword999!' });

    expect([200, 201]).toContain(loginResponse.status);
  });

  it('Dovrebbe eliminare la sessione al momento del logout (LogoutService)', async () => {
    // 1. Registrazione e Login per ottenere il Refresh Token
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'logout@example.com', password: 'StrongPassword123!' });

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'logout@example.com', password: 'StrongPassword123!' });

    const refreshToken = loginResponse.body.refreshToken;

    // 2. Eseguiamo il Logout
    const logoutResponse = await request(app.getHttpServer())
      .post('/auth/logout') // <-- Modifica se usi un'altra rotta
      .send({ refreshToken: refreshToken });

    expect([200, 201, 204]).toContain(logoutResponse.status);

    // 3. Verifichiamo nel DB che la sessione sia stata davvero cancellata
    const sessionCheck = await dbPool.query('SELECT * FROM sessions WHERE refresh_token = $1', [refreshToken]);
    expect(sessionCheck.rows.length).toBe(0);
  });

  it('Dovrebbe eliminare un utente con successo estraendo l\'ID dal Token (DeleteUserController)', async () => {
    // 1. Registrazione dell'utente da eliminare
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'delete-me@example.com', password: 'StrongPassword123!' });

    // Dalla registrazione (o dal login), recuperiamo l'Access Token!
    const accessToken = registerResponse.body.accessToken;
    
    // Assicuriamoci di avere davvero il token prima di procedere
    expect(accessToken).toBeDefined();

    // 2. Eliminiamo l'utente usando l'endpoint corretto e passando il token JWT
    const deleteResponse = await request(app.getHttpServer())
      .delete('/users/me') // <-- LA ROTTA GIUSTA!
      .set('Authorization', `Bearer ${accessToken}`) // <-- IL TOKEN NELL'HEADER!
      .send(); // Non serve più il body

    // 3. Verifichiamo che la cancellazione sia andata a buon fine
    expect([200, 201, 204]).toContain(deleteResponse.status);
    expect(deleteResponse.body.deleted).toBe(true);

    // 4. Verifichiamo che l'utente sia davvero sparito provando a fare login
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'delete-me@example.com', password: 'StrongPassword123!' });

    // Il login deve fallire con un errore di credenziali invalide / utente non trovato
    expect([400, 401, 404, 500]).toContain(loginResponse.status);
  });

  // --- TEST DEI CASI LIMITE E SICUREZZA (UNHAPPY PATHS) ---

  it('Dovrebbe impedire la registrazione se l\'email è già in uso', async () => {
    const user = { email: 'clone@example.com', password: 'StrongPassword123!' };

    // 1. Prima registrazione (successo)
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(user)
      .expect(201);

    // 2. Seconda registrazione con la stessa email (deve fallire)
    const duplicateResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send(user);

    // Ci aspettiamo un errore lato client (400 Bad Request o 409 Conflict) o un 500 se non hai ancora gestito l'errore di Unique Constraint di Postgres
    expect([400, 409, 500]).toContain(duplicateResponse.status);
  });

  it('Dovrebbe rifiutare il login se l\'email non esiste nel database', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'fantasma@example.com', password: 'StrongPassword123!' });

    // Non deve permettere l'accesso. Può essere 404 (Not Found) o 401 (Unauthorized)
    expect([400, 401, 404, 500]).toContain(loginResponse.status);
  });

  it('Dovrebbe bloccare l\'eliminazione dell\'utente se non viene fornito il Token JWT (Sicurezza)', async () => {
    const deleteResponse = await request(app.getHttpServer())
      .delete('/users/me')
      // NOTA: Non stiamo impostando l'header 'Authorization' di proposito!
      .send();

    // Il controller DEVE respingere la richiesta con 401 Unauthorized
    expect(deleteResponse.status).toBe(401);
  });
});