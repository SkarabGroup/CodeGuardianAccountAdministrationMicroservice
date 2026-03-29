import { EncryptedPat } from '../../../src/domain/value-objects/encrypted-pat.vo';

const VALID_ENCRYPTED = 'dGVzdGNpcGhlcnRleHRmb3J1bml0dGVzdA==';
const VALID_ENCRYPTED_2 = 'YW5vdGhlcnZhbGlkYmFzZTY0c3RyaW5nIQ==';

describe('EncryptedPat', () => {
  describe('create()', () => {
    it('should create a valid EncryptedPat from a base64 string', () => {
      const ep = EncryptedPat.create(VALID_ENCRYPTED);
      expect(ep).toBeDefined();
      expect(ep.value).toBe(VALID_ENCRYPTED);
    });

    it('should accept base64 strings with padding characters', () => {
      const ep = EncryptedPat.create(VALID_ENCRYPTED_2);
      expect(ep).toBeDefined();
    });

    it('should throw when the value is an empty string', () => {
      expect(() => EncryptedPat.create('')).toThrow(
        'EncryptedPat cannot be null, empty, or blank',
      );
    });

    it('should throw when the value is a blank string', () => {
      expect(() => EncryptedPat.create('   ')).toThrow(
        'EncryptedPat cannot be null, empty, or blank',
      );
    });

    it('should throw when the value contains non-base64 characters', () => {
      expect(() => EncryptedPat.create('not#valid base64!!')).toThrow(
        'EncryptedPat must be a valid base64-encoded string',
      );
    });

    it('should throw when the value is valid base64 but too short', () => {
      expect(() => EncryptedPat.create('YWJj')).toThrow(
        'EncryptedPat is too short to be a valid encrypted token',
      );
    });
  });

  describe('equals()', () => {
    it('should return true for two EncryptedPats with the same value', () => {
      const a = EncryptedPat.create(VALID_ENCRYPTED);
      const b = EncryptedPat.create(VALID_ENCRYPTED);
      expect(a.equals(b)).toBe(true);
    });

    it('should return false for two EncryptedPats with different values', () => {
      const a = EncryptedPat.create(VALID_ENCRYPTED);
      const b = EncryptedPat.create(VALID_ENCRYPTED_2);
      expect(a.equals(b)).toBe(false);
    });

    it('should return false when compared with a plain object', () => {
      const a = EncryptedPat.create(VALID_ENCRYPTED);
      const fake = { _value: VALID_ENCRYPTED } as unknown as EncryptedPat;
      expect(a.equals(fake)).toBe(false);
    });
  });
});
