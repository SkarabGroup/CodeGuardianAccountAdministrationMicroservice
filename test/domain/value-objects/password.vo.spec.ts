import { Password } from '../../../src/domain/value-objects/password.vo';

describe('Password', () => {
  describe('create()', () => {
    it('should create a valid password', () => {
      const password = Password.create('Password1.');
      expect(password).toBeInstanceOf(Password);
    });

    it('should throw when the value is an empty string', () => {
      expect(() => Password.create('')).toThrow(
        'Password cannot be null, empty, or blank',
      );
    });

    it('should throw when the value is a blank string', () => {
      expect(() => Password.create('   ')).toThrow(
        'Password cannot be null, empty, or blank',
      );
    });

    it('should throw when the password has no uppercase letter', () => {
      expect(() => Password.create('password1.')).toThrow(
        'Password is not valid',
      );
    });

    it('should throw when the password has no lowercase letter', () => {
      expect(() => Password.create('PASSWORD1.')).toThrow(
        'Password is not valid',
      );
    });

    it('should throw when the password has no digit', () => {
      expect(() => Password.create('Password.')).toThrow(
        'Password is not valid',
      );
    });

    it('should throw when the password has no special character', () => {
      expect(() => Password.create('Password1')).toThrow(
        'Password is not valid',
      );
    });

    it('should throw when the password is shorter than 8 characters', () => {
      expect(() => Password.create('Pwd1.')).toThrow('Password is not valid');
    });
  });

  describe('value', () => {
    it('should return the raw password value', () => {
      const password = Password.create('Password1.');
      expect(password.value).toBe('Password1.');
    });
  });

  describe('equals()', () => {
    it('should return true for two equal passwords', () => {
      const a = Password.create('Password1.');
      const b = Password.create('Password1.');
      expect(a.equals(b)).toBe(true);
    });

    it('should return false for two different passwords', () => {
      const a = Password.create('Password1.');
      const b = Password.create('Password1!');
      expect(a.equals(b)).toBe(false);
    });

    it('should return false when compared with a plain object', () => {
      const a = Password.create('Password1.');
      const fake = { _value: 'Password1.' } as unknown as Password;
      expect(a.equals(fake)).toBe(false);
    });
  });
});
