import { v4 as uuid } from 'uuid';
import { User } from '../../../src/domain/entities/user.entity';
import { UserId } from '../../../src/domain/value-objects/user-id.vo';
import { Email } from '../../../src/domain/value-objects/email.vo';
import { PasswordHash } from '../../../src/domain/value-objects/password-hash.vo';

const VALID_HASH = '$2b$10$' + 'a'.repeat(53);
const DIFFERENT_HASH = '$2b$12$' + 'b'.repeat(53);

describe('User Entity', () => {
  let email: Email;
  let passwordHash: PasswordHash;

  beforeEach(() => {
    email = Email.create('test@example.com');
    passwordHash = PasswordHash.create(VALID_HASH);
  });

  describe('create()', () => {
    it('should create a valid User instance', () => {
      const user = User.create(email, passwordHash);
      expect(user).toBeInstanceOf(User);
    });

    it('should generate a UserId automatically', () => {
      const user = User.create(email, passwordHash);
      expect(user.getUserId()).toBeInstanceOf(UserId);
    });

    it('should set createdAt and updatedAt to the same value on creation', () => {
      const user = User.create(email, passwordHash);
      expect(user.getCreatedAt()).toEqual(user.getUpdatedAt());
    });

    it('should return the correct email', () => {
      const user = User.create(email, passwordHash);
      expect(user.getEmail()).toBeInstanceOf(Email);
      expect(user.getEmail().value).toBe('test@example.com');
    });

    it('should return the correct passwordHash', () => {
      const user = User.create(email, passwordHash);
      expect(user.getPasswordHash()).toBeInstanceOf(PasswordHash);
      expect(user.getPasswordHash().value).toBe(VALID_HASH);
    });

    it('should generate a different UserId for each user', () => {
      const a = User.create(email, passwordHash);
      const b = User.create(email, passwordHash);
      expect(a.getUserId().equals(b.getUserId())).toBe(false);
    });
  });

  describe('reconstitute()', () => {
    it('should reconstitute a User with the provided values', () => {
      const userId = UserId.create(uuid());
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

    it('should preserve the original UserId without generating a new one', () => {
      const userId = UserId.create(uuid());
      const user = User.reconstitute(
        userId,
        email,
        passwordHash,
        new Date(),
        new Date(),
      );
      expect(user.getUserId().equals(userId)).toBe(true);
    });
  });

  describe('updatePassword()', () => {
    it('should update the passwordHash correctly', () => {
      const user = User.create(email, passwordHash);
      const newHash = PasswordHash.create(DIFFERENT_HASH);
      user.updatePassword(newHash);
      expect(user.getPasswordHash().value).toBe(DIFFERENT_HASH);
    });

    it('should update updatedAt after password change', () => {
      const user = User.create(email, passwordHash);
      const updatedAtBefore = user.getUpdatedAt();
      user.updatePassword(PasswordHash.create(DIFFERENT_HASH));
      expect(user.getUpdatedAt().getTime()).toBeGreaterThanOrEqual(
        updatedAtBefore.getTime(),
      );
    });

    it('should not change createdAt after password update', () => {
      const user = User.create(email, passwordHash);
      const createdAt = user.getCreatedAt();
      user.updatePassword(PasswordHash.create(DIFFERENT_HASH));
      expect(user.getCreatedAt()).toEqual(createdAt);
    });
  });
  describe('equals()', ()=>{
    it('dovrebbe restituire true per due utenti con stesso userId', () =>{
      const userId = UserId.create(uuid());
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
    it('dovrebbe restituire false per due utenti con userId diversi', () =>{
      const userA = User.create(email, passwordHash);
      const userB = User.create(email, passwordHash);
      expect(userA.equals(userB)).toBe(false);
    });     
  });
});
