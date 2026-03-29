import { Username } from '../../../src/domain/value-objects/username.vo';

describe('Username', () => {
  describe('create()', () => {
    it('should create a valid username', () => {
      const username = Username.create('johnDoe99');
      expect(username).toBeInstanceOf(Username);
    });

    it('should throw when the value is an empty string', () => {
      expect(() => Username.create('')).toThrow(
        'Username cannot be null, empty, or blank',
      );
    });

    it('should throw when the value is a blank string', () => {
      expect(() => Username.create('   ')).toThrow(
        'Username cannot be null, empty, or blank',
      );
    });

    it('should throw when the username contains special characters', () => {
      expect(() => Username.create('invalid!user')).toThrow(
        'Username is not valid',
      );
    });

    it('should throw when the username is shorter than 4 characters', () => {
      expect(() => Username.create('abc')).toThrow('Username is not valid');
    });

    it('should throw when the username is longer than 20 characters', () => {
      expect(() => Username.create('thisUsernameIsTooLongToBeValid')).toThrow(
        'Username is not valid',
      );
    });
  });

  describe('value', () => {
    it('should return the stored value', () => {
      const username = Username.create('johnDoe99');
      expect(username.value).toBe('johnDoe99');
    });
  });

  describe('equals()', () => {
    it('should return true for two equal usernames', () => {
      const a = Username.create('johnDoe99');
      const b = Username.create('johnDoe99');
      expect(a.equals(b)).toBe(true);
    });

    it('should return false for two different usernames', () => {
      const a = Username.create('johnDoe99');
      const b = Username.create('janeDoe99');
      expect(a.equals(b)).toBe(false);
    });

    it('should return false when compared with a plain object', () => {
      const a = Username.create('johnDoe99');
      const fake = { _value: 'johnDoe99' } as unknown as Username;
      expect(a.equals(fake)).toBe(false);
    });
  });
});
