import { Email } from '../../../src/domain/value-objects/email.vo';

describe('Email', () => {
  describe('create()', () => {
    it('should create a valid email', () => {
      const email = Email.create('test@example.com');
      expect(email).toBeInstanceOf(Email);
    });

    it('should create a valid email and normalize to lowercase', () => {
      const email = Email.create('Test@Example.COM');
      expect(email.value).toBe('test@example.com');
    });

    it('should throw when the value is an empty string', () => {
      expect(() => Email.create('')).toThrow(
        'Email cannot be null, empty, or blank',
      );
    });

    it('should throw when the value is a blank string', () => {
      expect(() => Email.create('   ')).toThrow(
        'Email cannot be null, empty, or blank',
      );
    });

    it('should throw when the format is invalid', () => {
      expect(() => Email.create('not-an-email')).toThrow('Email is not valid');
    });

    it('should throw when the domain is missing', () => {
      expect(() => Email.create('user@')).toThrow('Email is not valid');
    });
  });

  describe('value', () => {
    it('should return the normalized value', () => {
      const email = Email.create('test@example.com');
      expect(email.value).toBe('test@example.com');
    });

    it('should return the lowercased value when created with uppercase', () => {
      const email = Email.create('TEST@EXAMPLE.COM');
      expect(email.value).toBe('test@example.com');
    });
  });

  describe('equals()', () => {
    it('should return true for two equal emails', () => {
      const a = Email.create('user@example.com');
      const b = Email.create('user@example.com');
      expect(a.equals(b)).toBe(true);
    });

    it('should return true normalizing uppercase', () => {
      const a = Email.create('User@Example.com');
      const b = Email.create('user@example.com');
      expect(a.equals(b)).toBe(true);
    });

    it('should return false for two different emails', () => {
      const a = Email.create('a@example.com');
      const b = Email.create('b@example.com');
      expect(a.equals(b)).toBe(false);
    });

    it('should return false when compared with a plain object', () => {
      const a = Email.create('user@example.com');
      const fake = { _value: 'user@example.com' } as unknown as Email;
      expect(a.equals(fake)).toBe(false);
    });
  });
});
