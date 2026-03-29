import { UserId } from '../../../src/domain/value-objects/user-id.vo';

const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';
const VALID_UUID_2 = '123e4568-e89b-12d3-a456-426614174000';

describe('UserId', () => {
  describe('create()', () => {
    it('should create a valid UserId from a well-formed UUID', () => {
      const userId = UserId.create(VALID_UUID);
      expect(userId).toBeInstanceOf(UserId);
    });

    it('should throw when the value is an empty string', () => {
      expect(() => UserId.create('')).toThrow('Invalid UUID format for UserId');
    });

    it('should throw when the value is not a valid UUID', () => {
      expect(() =>
        UserId.create('123e4567-e89b-12d3-a456-426614174000329r8--ca--'),
      ).toThrow('Invalid UUID format for UserId');
    });
  });

  describe('generate()', () => {
    it('should generate a valid UserId', () => {
      const userId = UserId.generate();
      expect(userId).toBeInstanceOf(UserId);
      expect(userId.value).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });

    it('should generate unique values on each call', () => {
      const a = UserId.generate();
      const b = UserId.generate();
      expect(a.equals(b)).toBe(false);
    });
  });

  describe('value', () => {
    it('should return the stored value', () => {
      const userId = UserId.create(VALID_UUID);
      expect(userId.value).toBe(VALID_UUID);
    });
  });

  describe('equals()', () => {
    it('should return true for two UserIds with the same value', () => {
      const a = UserId.create(VALID_UUID);
      const b = UserId.create(VALID_UUID);
      expect(a.equals(b)).toBe(true);
    });

    it('should return false for two UserIds with different values', () => {
      const a = UserId.create(VALID_UUID);
      const b = UserId.create(VALID_UUID_2);
      expect(a.equals(b)).toBe(false);
    });

    it('should return false when compared with a plain object', () => {
      const a = UserId.create(VALID_UUID);
      const fake = { _value: VALID_UUID } as unknown as UserId;
      expect(a.equals(fake)).toBe(false);
    });
  });
});
