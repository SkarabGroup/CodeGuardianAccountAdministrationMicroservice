import { PostgresAdapter } from '../../src/infrastructure/adapters/postgre.adapter'; // Assicurati che il path sia corretto
import { Pool } from 'pg';
import { User } from '../../src/domain/entities/user.entity';
import { UserId } from '../../src/domain/value-objects/user-id.vo';
import { Email } from '../../src/domain/value-objects/email.vo';
import { PasswordHash } from '../../src/domain/value-objects/password-hash.vo';

// 1. Diciamo a Jest di mockare l'intera libreria 'pg'
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
    it('dovrebbe eseguire una query INSERT con i valori corretti estratti dall\'Entità', async () => {
      await adapter.save(testUser);

      // Verifichiamo che la funzione query sia stata chiamata 1 volta
      expect(queryMock).toHaveBeenCalledTimes(1);

      // Estraiamo gli argomenti con cui è stata chiamata
      const [sqlQuery, values] = queryMock.mock.calls[0];

      // Verifichiamo che la query contenga le parole chiave giuste
      expect(sqlQuery).toContain('INSERT INTO users');
      expect(sqlQuery).toContain('(id, email, password_hash, created_at, updated_at)');
      expect(sqlQuery).toContain('VALUES ($1, $2, $3, $4, $5)');

      // Verifichiamo che i valori passati al DB siano i primitivi "spacchettati" dai VO
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
    it('dovrebbe restituire null se l\'utente non esiste nel database', async () => {
      // Simuliamo il comportamento di 'pg' quando la query non trova nulla (rows vuoto)
      queryMock.mockResolvedValueOnce({ rows: [] });

      const result = await adapter.find(validEmailStr);

      expect(queryMock).toHaveBeenCalledTimes(1);
      expect(queryMock).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM users WHERE email = $1'),
        [validEmailStr]
      );
      expect(result).toBeNull();
    });

    it('dovrebbe ricostituire e restituire un\'Entità User se l\'utente viene trovato', async () => {
      // Simuliamo la riga restituita dal database
      const dbRecord = {
        id: validUuidV7,
        email: validEmailStr,
        password_hash: validHashStr,
        created_at: now.toISOString(), // Il DB spesso restituisce le date come stringhe ISO o oggetti Date
        updated_at: now.toISOString(),
      };

      // Diciamo al mock di restituire il nostro record
      queryMock.mockResolvedValueOnce({ rows: [dbRecord] });

      const result = await adapter.find(validEmailStr);

      expect(queryMock).toHaveBeenCalledTimes(1);
      
      // Verifichiamo che il risultato sia una vera istanza di User
      expect(result).toBeInstanceOf(User);
      
      // Verifichiamo che tutti i Value Object interni siano stati popolati correttamente
      expect(result?.getUserId().value).toBe(validUuidV7);
      expect(result?.getEmail().value).toBe(validEmailStr);
      expect(result?.getPasswordHash().value).toBe(validHashStr);
      expect(result?.getCreatedAt()).toEqual(now);
      expect(result?.getUpdatedAt()).toEqual(now);
    });
  });
});