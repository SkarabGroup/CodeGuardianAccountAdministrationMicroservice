import { v7 as uuid } from 'uuid';
import { GithubToken } from '../../../src/domain/entities/github-token.entity';
import { UserId } from '../../../src/domain/value-objects/user-id.vo';
import { GithubId } from '../../../src/domain/value-objects/github-id.vo';
import { EncryptedPat } from '../../../src/domain/value-objects/encrypted-pat.vo';

const VALID_ENCRYPTED = 'dGVzdGNpcGhlcnRleHRmb3J1bml0dGVzdA==';
const DIFFERENT_ENCRYPTED = 'YW5vdGhlcnZhbGlkYmFzZTY0c3RyaW5nIQ==';

describe('GithubToken Entity', () => {
  let userId: UserId;
  let githubId: GithubId;
  let encryptedPat: EncryptedPat;

  beforeEach(() => {
    userId = UserId.create(uuid());
    githubId = GithubId.create('12354687');
    encryptedPat = EncryptedPat.create(VALID_ENCRYPTED);
  });

  describe('create()', () => {
    it('should create a valid GithubToken instance', () => {
      const token = GithubToken.create(userId, githubId, encryptedPat);
      expect(token).toBeInstanceOf(GithubToken);
    });

    it('should return the correct userId', () => {
      const token = GithubToken.create(userId, githubId, encryptedPat);
      expect(token.getUserId()).toBeInstanceOf(UserId);
      expect(token.getUserId().equals(userId)).toBe(true);
    });

    it('should return the correct githubId', () => {
      const token = GithubToken.create(userId, githubId, encryptedPat);
      expect(token.getGithubId()).toBeInstanceOf(GithubId);
      expect(token.getGithubId().value).toBe('12354687');
    });

    it('should return the correct encryptedPat', () => {
      const token = GithubToken.create(userId, githubId, encryptedPat);
      expect(token.getEncryptedPat()).toBeInstanceOf(EncryptedPat);
      expect(token.getEncryptedPat().value).toBe(VALID_ENCRYPTED);
    });
  });

  describe('reconstitute()', () => {
    it('should reconstitute a GithubToken with the provided values', () => {
      const token = GithubToken.reconstitute(userId, githubId, encryptedPat);
      expect(token).toBeInstanceOf(GithubToken);
    });

    it('should preserve the original userId without generating a new one', () => {
      const token = GithubToken.reconstitute(userId, githubId, encryptedPat);
      expect(token.getUserId().equals(userId)).toBe(true);
    });

    it('should preserve the original encryptedPat', () => {
      const token = GithubToken.reconstitute(userId, githubId, encryptedPat);
      expect(token.getEncryptedPat().value).toBe(VALID_ENCRYPTED);
    });
  });

  describe('updatePat()', () => {
    it('should update the encryptedPat correctly', () => {
      const token = GithubToken.create(userId, githubId, encryptedPat);
      const newPat = EncryptedPat.create(DIFFERENT_ENCRYPTED);
      token.updatePat(newPat);
      expect(token.getEncryptedPat().value).toBe(DIFFERENT_ENCRYPTED);
    });

    it('should not affect userId after pat update', () => {
      const token = GithubToken.create(userId, githubId, encryptedPat);
      token.updatePat(EncryptedPat.create(DIFFERENT_ENCRYPTED));
      expect(token.getUserId().equals(userId)).toBe(true);
    });

    it('should not affect githubId after pat update', () => {
      const token = GithubToken.create(userId, githubId, encryptedPat);
      token.updatePat(EncryptedPat.create(DIFFERENT_ENCRYPTED));
      expect(token.getGithubId().value).toBe('12354687');
    });
  });

  describe('equals()', () => {
    it('should return true for two tokens with the same userId', () => {
      const a = GithubToken.create(userId, githubId, encryptedPat);
      const b = GithubToken.create(userId, githubId, encryptedPat);
      expect(a.equals(b)).toBe(true);
    });

    it('should return false for two tokens with different userIds', () => {
      const a = GithubToken.create(userId, githubId, encryptedPat);
      const b = GithubToken.create(
        UserId.create(uuid()),
        githubId,
        encryptedPat,
      );
      expect(a.equals(b)).toBe(false);
    });
  });
});
