import { User } from '../../../src/domain/entities/user.entity';
import { UserId } from '../../../src/domain/value-objects/user-id.vo';
import { Email } from '../../../src/domain/value-objects/email.vo';
import { PasswordHash } from '../../../src/domain/value-objects/password-hash.vo';

const VALID_HASH = '$2b$10$' + 'a'.repeat(53);
const DIFFERENT_HASH = '$2b$12$' + 'b'.repeat(53);

const VALID_UUID_V7 = '018f4567-e89b-72d3-a456-426614174000';
const ANOTHER_UUID_V7 = '018f4568-e89b-72d3-a456-426614174000'; // Utile per testare la disuguaglianza

describe('User Entity', () => {
  let userId: UserId;
  let email: Email;
  let passwordHash: PasswordHash;

  beforeEach(() => {
    // Ora creiamo l'ID nel beforeEach da passare all'entità
    userId = UserId.create(VALID_UUID_V7);
    email = Email.create('test@example.com');
    passwordHash = PasswordHash.create(VALID_HASH);
  });

  describe('create()', () => {
    it('dovrebbe creare un\'istanza valida di User', () => {
      // Passiamo l'ID come primo parametro!
      const user = User.create(userId, email, passwordHash);
      expect(user).toBeInstanceOf(User);
    });

    // Questo test è stato rinominato: l'Entità non genera più l'ID, lo riceve
    it('dovrebbe assegnare l\'UserId fornito correttamente', () => {
      const user = User.create(userId, email, passwordHash);
      expect(user.getUserId()).toBeInstanceOf(UserId);
      expect(user.getUserId().equals(userId)).toBe(true);
    });

    it('dovrebbe impostare createdAt e updatedAt allo stesso valore alla creazione', () => {
      const user = User.create(userId, email, passwordHash);
      expect(user.getCreatedAt()).toEqual(user.getUpdatedAt());
    });

    it('dovrebbe restituire l\'email corretta', () => {
      const user = User.create(userId, email, passwordHash);
      expect(user.getEmail()).toBeInstanceOf(Email);
      expect(user.getEmail().value).toBe('test@example.com');
    });

    it('dovrebbe restituire il passwordHash corretto', () => {
      const user = User.create(userId, email, passwordHash);
      expect(user.getPasswordHash()).toBeInstanceOf(PasswordHash);
      expect(user.getPasswordHash().value).toBe(VALID_HASH);
    });
  });

  describe('reconstitute()', () => {
    it('dovrebbe ricostituire uno User con i valori forniti', () => {
      const createdAt = new Date('2026-01-01');
      const updatedAt = new Date('2026-04-01');

      const user = User.reconstitute(
        userId,
        email,
        passwordHash,
        createdAt,
        updatedAt,
      );

      expect(user).toBeInstanceOf(User);
      expect(user.getUserId()).toBe(userId);
      expect(user.getEmail()).toBe(email);
      expect(user.getPasswordHash()).toBe(passwordHash);
      expect(user.getCreatedAt()).toBe(createdAt);
      expect(user.getUpdatedAt()).toBe(updatedAt);
    });
  });

  describe('updatePassword()', () => {
    it('dovrebbe aggiornare il passwordHash correttamente', () => {
      const user = User.create(userId, email, passwordHash);
      const newHash = PasswordHash.create(DIFFERENT_HASH);
      user.updatePassword(newHash);
      expect(user.getPasswordHash().value).toBe(DIFFERENT_HASH);
    });

    it('dovrebbe aggiornare updatedAt dopo il cambio password', () => {
      const user = User.create(userId, email, passwordHash);
      const updatedAtBefore = user.getUpdatedAt();
      user.updatePassword(PasswordHash.create(DIFFERENT_HASH));
      expect(user.getUpdatedAt().getTime()).toBeGreaterThanOrEqual(
        updatedAtBefore.getTime(),
      );
    });

    it('dovrebbe lasciare invariato createdAt dopo l\'aggiornamento della password', () => {
      const user = User.create(userId, email, passwordHash);
      const createdAt = user.getCreatedAt();
      user.updatePassword(PasswordHash.create(DIFFERENT_HASH));
      expect(user.getCreatedAt()).toEqual(createdAt);
    });
  });

  describe('equals()', () => {
    it('dovrebbe restituire true per due utenti con stesso userId', () => {
      const userA = User.reconstitute(
        userId,
        email,
        passwordHash,
        new Date(),
        new Date(),
      );
      const userB = User.reconstitute(
        userId,
        email,
        passwordHash,
        new Date(),
        new Date(),
      );
      expect(userA.equals(userB)).toBe(true);
    });

    it('dovrebbe restituire false per due utenti con userId diversi', () => {
      // Creiamo un secondo ID diverso appositamente per questo test
      const differentUserId = UserId.create(ANOTHER_UUID_V7);
      
      const userA = User.create(userId, email, passwordHash);
      const userB = User.create(differentUserId, email, passwordHash);
      
      expect(userA.equals(userB)).toBe(false);
    });
  });
});