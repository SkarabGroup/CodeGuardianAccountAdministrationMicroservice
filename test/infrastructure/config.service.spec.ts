import type { AppConfig } from '../../src/infrastructure/configuration/env.config.type';
import { loadConfig } from '../../src/infrastructure/configuration/env.config.service';

describe('Configurazione di Ambiente (loadConfig)', () => {
  // Salviamo l'ambiente originale usando il tipo nativo di Node.js
  const originalEnv: NodeJS.ProcessEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    // Creiamo un clone pulito tipizzato esattamente come l'originale
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // Ripristiniamo l'ambiente reale a fine test
    process.env = originalEnv;
  });

  it('dovrebbe caricare i dati correttamente se tutte le variabili sono presenti', () => {
    process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/db';
    process.env.JWT_SECRET = 'segreto-super-sicuro';
    process.env.BCRYPT_ROUNDS = '12';

    // TS sa già che 'config' è di tipo AppConfig
    const config: AppConfig = loadConfig();

    expect(config.db.url).toBe('postgres://user:pass@localhost:5432/db');
    expect(config.security.jwtSecret).toBe('segreto-super-sicuro');
    expect(config.security.bcryptRounds).toBe(12);
  });

  it('dovrebbe usare 10 come valore di default per BCRYPT_ROUNDS se omesso', () => {
    process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/db';
    process.env.JWT_SECRET = 'segreto-super-sicuro';
    
    // 'delete' è type-safe su NodeJS.ProcessEnv perché i valori possono essere undefined
    delete process.env.BCRYPT_ROUNDS;

    const config: AppConfig = loadConfig();

    expect(config.security.bcryptRounds).toBe(10);
  });

  it('dovrebbe lanciare un errore se DATABASE_URL è mancante', () => {
    delete process.env.DATABASE_URL;
    process.env.JWT_SECRET = 'segreto-super-sicuro';

    expect(() => loadConfig()).toThrow('DATABASE_URL mancante');
  });

  it('dovrebbe lanciare un errore se JWT_SECRET è mancante', () => {
    process.env.DATABASE_URL = 'postgres://user:pass@localhost:5432/db';
    delete process.env.JWT_SECRET;

    expect(() => loadConfig()).toThrow('JWT_SECRET mancante');
  });
});
