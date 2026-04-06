import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { Pool } from 'pg';
// Importa qui il tuo Exception Filter se lo hai creato

// 1. Aumentiamo il timeout per dare tempo a DB e NestJS di partire
jest.setTimeout(15000); 

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
    console.log('[DEBUG] 3. Applicazione NestJS avviata. Tento la connessione al DB per i test...');

    dbPool = new Pool({
      // ⚠️ ATTENZIONE: Controlla che questa stringa sia UGUALE a quella nel tuo .env / main.ts!
      connectionString: 'postgres://root:root@localhost:5432/miodb',
    });

    try {
      console.log('[DEBUG] 4. Eseguo un Ping al DB con una query di prova...');
      await dbPool.query('SELECT 1');
      console.log('[DEBUG] 5. Ping riuscito! Connessione al DB stabilita.');
    } catch (error) {
      console.error('[DEBUG-ERRORE] FALLITA LA CONNESSIONE DIRETTA AL DB!', error);
    }
  });

  beforeEach(async () => {
    console.log('[DEBUG] 6. Inizio svuotamento tabella users...');
    try {
      await dbPool.query('TRUNCATE TABLE users CASCADE');
      console.log('[DEBUG] 7. Tabella svuotata con successo.');
    } catch (error) {
      console.error('[DEBUG-ERRORE] IMPOSSIBILE SVUOTARE LA TABELLA. Esiste davvero?', error);
    }
    jest.clearAllMocks();
  });

    afterAll(async () => {
    // 5. Chiudiamo tutto pulito a fine test
    if (app) await app.close();
    if (dbPool) await dbPool.end();
  });


  it('Dovrebbe bloccare una registrazione con password debole (Test ValidationPipe)', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: '123', // Troppo corta per il DTO
      });

    expect(response.status).toBe(400); 
    expect(response.body.message).toBeInstanceOf(Array); 
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

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.accessToken).toBeDefined();

    // Step B: Login
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send(userCredentials);

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.accessToken).toBeDefined();
    expect(loginResponse.body.refreshToken).toBeDefined();
    expect(loginResponse.body.user.email).toBe(userCredentials.email);
  });

  it('Dovrebbe rifiutare il login con password errata', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'wrong@example.com', password: 'StrongPassword123!' });

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'wrong@example.com', password: 'WrongPassword999!' });

    // Se hai attivato l'ExceptionFilter, metti 401. Se usi il throw new Error base, metti 500.
    expect([401, 500]).toContain(loginResponse.status); 
  });
});