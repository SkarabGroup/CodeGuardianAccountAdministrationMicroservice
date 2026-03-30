import { PasswordHash } from '../../../src/domain/value-objects/password-hash.vo';

const VALID_2B = '$2b$10$' + 'a'.repeat(53);
const VALID_2A = '$2a$10$' + 'a'.repeat(53);
const DIFFERENT_HASH = '$2b$12$' + 'b'.repeat(53);

describe('PasswordHash', () => {
  it('should create a valid hash with $2b$ prefix', () => {
    const hash = PasswordHash.create(VALID_2B);
    expect(hash).toBeDefined();
  });

  it('should create a valid hash with $2a$ prefix', () => {
    const hash = PasswordHash.create(VALID_2A);
    expect(hash).toBeDefined();
  });

  it('should return the correct value', () => {
    const hash = PasswordHash.create(VALID_2B);
    expect(hash.value).toBe(VALID_2B);
  });

  it('should compare two identical hashes as equal', () => {
    const a = PasswordHash.create(VALID_2B);
    const b = PasswordHash.create(VALID_2B);
    expect(a.equals(b)).toBe(true);
  });

  it('should compare two different hashes as not equal', () => {
    const a = PasswordHash.create(VALID_2B);
    const b = PasswordHash.create(DIFFERENT_HASH);
    expect(a.equals(b)).toBe(false);
  });

  it('should compare with a non-PasswordHash object as not equal', () => {
    const hash = PasswordHash.create(VALID_2B);
    const fake = { _value: VALID_2B };
    expect(hash.equals(fake as unknown as PasswordHash)).toBe(false);
  });

  it('should throw when the value is an empty string', () => {
    expect(() => PasswordHash.create('')).toThrow(
      'PasswordHash cannot be empty',
    );
  });

  it('should throw when the value is a blank string', () => {
    expect(() => PasswordHash.create('   ')).toThrow(
      'PasswordHash cannot be empty',
    );
  });

  it('should throw when the value is not a bcrypt hash', () => {
    expect(() => PasswordHash.create('Password1.')).toThrow(
      'PasswordHash is not a valid bcrypt hash',
    );
    expect(() =>
      PasswordHash.create('5f4dcc3b5aa765d61d8327deb882cf99'),
    ).toThrow('PasswordHash is not a valid bcrypt hash');
    expect(() => PasswordHash.create('$2x$10$' + 'a'.repeat(53))).toThrow(
      'PasswordHash is not a valid bcrypt hash',
    );
  });
});
