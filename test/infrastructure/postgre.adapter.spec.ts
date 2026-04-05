import { PostgresAdapter } from '../../src/infrastructure/adapters/postgre.adapter'; // Controlla che il path sia giusto
import { Pool } from 'pg';
import { User } from '../../src/domain/entities/user.entity';
import { UserId } from '../../src/domain/value-objects/user-id.vo';
import { Email } from '../../src/domain/value-objects/email.vo';
import { PasswordHash } from '../../src/domain/value-objects/password-hash.vo';

// 1. Definiamo anche qui l'interfaccia per far felice il linter
interface MockUserDbRecord {
  id: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

// Creiamo il mock tipizzandolo leggermente meglio
const queryMock = jest.fn();

jest.mock('pg', () => {
  return {
    Pool: jest.fn().mockImplementation(() => ({
      query: queryMock,
    })),
  };
});

describe('PostgresAdapter', () => {
  let adapter: PostgresAdapter;

  const validUuidV7 = '018f4567-e89b-72d3-a456-426614174000';
  const validEmailStr = 'test@example.com';
  const validHashStr = '$2b$10$' + 'a'.repeat(53);
  const now = new Date('2026-04-01T10:00:00.000Z');

  let testUser: User;

  beforeEach(() => {
    queryMock.mockClear();
    (Pool as unknown as jest.Mock).mockClear();

    adapter = new PostgresAdapter();

    testUser = User.reconstitute(
      UserId.create(validUuidV7),
      Email.create(validEmailStr),
      PasswordHash.create(validHashStr),
      now,
      now,
    );
  });

  describe('constructor', () => {
    it('dovrebbe inizializzare il Pool di connessione a Postgres', () => {
      expect(Pool).toHaveBeenCalledTimes(1);
    });
  });

  describe('save()', () => {
    it("dovrebbe eseguire una query INSERT con i valori corretti estratti dall'Entità", async () => {
      // Mockiamo una risoluzione vuota per l'INSERT (che di solito non ritorna righe)
      queryMock.mockResolvedValueOnce({ rows: [] });

      await adapter.save(testUser);

      expect(queryMock).toHaveBeenCalledTimes(1);

      // 2. Diciamo a TypeScript esattamente che tipo di dati aspettarci dalla chiamata mockata
      // Questo elimina gli errori "Unsafe assignment" o "Unsafe member access"
      const [sqlQuery, values] = queryMock.mock.calls[0] as [string, unknown[]];

      expect(sqlQuery).toContain('INSERT INTO users');
      expect(sqlQuery).toContain(
        '(id, email, password_hash, created_at, updated_at)',
      );
      expect(sqlQuery).toContain('VALUES ($1, $2, $3, $4, $5)');

      expect(values).toEqual([
        validUuidV7,
        validEmailStr,
        validHashStr,
        now,
        now,
      ]);
    });
  });

  describe('find()', () => {
    it("dovrebbe restituire null se l'utente non esiste nel database", async () => {
      // 3. Forziamo il tipo dell'array vuoto per rispettare l'interfaccia
      queryMock.mockResolvedValueOnce({ rows: [] as MockUserDbRecord[] });

      const result = await adapter.find(validEmailStr);

      expect(queryMock).toHaveBeenCalledTimes(1);
      expect(queryMock).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM users WHERE email = $1'),
        [validEmailStr],
      );
      expect(result).toBeNull();
    });

    it("dovrebbe ricostituire e restituire un'Entità User se l'utente viene trovato", async () => {
      // 4. Creiamo il record finto tipizzandolo rigidamente come MockUserDbRecord
      const dbRecord: MockUserDbRecord = {
        id: validUuidV7,
        email: validEmailStr,
        password_hash: validHashStr,
        created_at: now,
        updated_at: now,
      };

      queryMock.mockResolvedValueOnce({ rows: [dbRecord] });

      const result = await adapter.find(validEmailStr);

      expect(queryMock).toHaveBeenCalledTimes(1);

      expect(result).toBeInstanceOf(User);

      // Essendo result tipizzato come User | null, usiamo il ? per navigare in sicurezza
      expect(result?.getUserId().value).toBe(validUuidV7);
      expect(result?.getEmail().value).toBe(validEmailStr);
      expect(result?.getPasswordHash().value).toBe(validHashStr);
      expect(result?.getCreatedAt()).toEqual(now);
      expect(result?.getUpdatedAt()).toEqual(now);
    });
  });

  describe('Session Management', () => {
    const mockToken = 'mock-refresh-token';
    const expiresAt = new Date('2026-04-10T00:00:00Z');

    it('dovrebbe salvare una sessione con successo', async () => {
      queryMock.mockResolvedValueOnce({ rows: [] });

      await adapter.saveSession(validUuidV7, mockToken, expiresAt);

      expect(queryMock).toHaveBeenCalledTimes(1);
      const [sql, values] = queryMock.mock.calls[0] as [string, unknown[]];
      expect(sql).toContain('INSERT INTO sessions');
      expect(values).toContain(validUuidV7);
      expect(values).toContain(mockToken);
    });

    it('dovrebbe eliminare una sessione con successo', async () => {
      queryMock.mockResolvedValueOnce({ rows: [] });

      await adapter.deleteSession(mockToken);

      expect(queryMock).toHaveBeenCalledTimes(1);
      expect(queryMock).toHaveBeenCalledWith(
        expect.stringContaining(
          'DELETE FROM sessions WHERE refresh_token = $1',
        ),
        [mockToken],
      );
    });

    it('dovrebbe restituire true se la sessione è valida', async () => {
      queryMock.mockResolvedValueOnce({ rows: [{ id: 'some-id' }] });

      const result = await adapter.isSessionValid(mockToken);

      expect(result).toBe(true);
      expect(queryMock).toHaveBeenCalledWith(
        expect.stringContaining(
          'SELECT * FROM sessions WHERE refresh_token = $1',
        ),
        expect.arrayContaining([mockToken]),
      );
    });

    it('dovrebbe restituire false se la sessione è scaduta o non trovata', async () => {
      queryMock.mockResolvedValueOnce({ rows: [] });

      const result = await adapter.isSessionValid(mockToken);

      expect(result).toBe(false);
    });
  });
});
