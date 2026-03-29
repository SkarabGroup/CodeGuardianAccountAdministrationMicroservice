import { GithubId } from '../../../src/domain/value-objects/github-id.vo';

const VALID_ID = '12345678';
const VALID_ID_2 = '87654321';

describe('GithubId', () => {
  describe('create()', () => {
    it('should create a valid GithubId from a numeric string', () => {
      const id = GithubId.create(VALID_ID);
      expect(id).toBeDefined();
      expect(id.value).toBe(VALID_ID);
    });

    it('should accept a single-digit numeric string', () => {
      const id = GithubId.create('1');
      expect(id).toBeDefined();
    });

    it('should accept a 50-digit numeric string (column boundary)', () => {
      const id = GithubId.create('1'.repeat(50));
      expect(id).toBeDefined();
    });

    it('should throw when the value is an empty string', () => {
      expect(() => GithubId.create('')).toThrow(
        'GithubId cannot be null, empty, or blank',
      );
    });

    it('should throw when the value is a blank string', () => {
      expect(() => GithubId.create('   ')).toThrow(
        'GithubId cannot be null, empty, or blank',
      );
    });

    it('should throw when the value contains non-numeric characters', () => {
      expect(() => GithubId.create('abc123')).toThrow(
        'GithubId must be a non-empty numeric string (max 50 digits)',
      );
    });

    it('should throw when the value is a UUID instead of a numeric ID', () => {
      expect(() =>
        GithubId.create('550e8400-e29b-41d4-a716-446655440000'),
      ).toThrow('GithubId must be a non-empty numeric string (max 50 digits)');
    });

    it('should throw when the value exceeds 50 digits', () => {
      expect(() => GithubId.create('1'.repeat(51))).toThrow(
        'GithubId must be a non-empty numeric string (max 50 digits)',
      );
    });
  });

  describe('equals()', () => {
    it('should return true for two GithubIds with the same value', () => {
      const a = GithubId.create(VALID_ID);
      const b = GithubId.create(VALID_ID);
      expect(a.equals(b)).toBe(true);
    });

    it('should return false for two GithubIds with different values', () => {
      const a = GithubId.create(VALID_ID);
      const b = GithubId.create(VALID_ID_2);
      expect(a.equals(b)).toBe(false);
    });

    it('should return false when compared with a plain object', () => {
      const a = GithubId.create(VALID_ID);
      const fake = { _value: VALID_ID } as unknown as GithubId;
      expect(a.equals(fake)).toBe(false);
    });
  });
});
