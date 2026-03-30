import { GithubTokenFactory } from '../../../src/domain/factories/github-token-factory.factory';
import { IEncryptTextPort } from '../../../src/application/ports/i-encrypt-text-port.port';
import { GithubTokenDTO } from '../../../src/application/DTOs/github-token-dto.dto';
import { v4 as uuid } from 'uuid';

describe('GithubTokenFactory', () => {
  let factory: GithubTokenFactory;
  let encryptorMock: jest.Mocked<IEncryptTextPort>;

  const validUserId = uuid();
  const validGithubId = '221676739';
  const validPat = 'ghp_' + 'a'.repeat(36);
  const fakeEncryptedPat = 'A'.repeat(64);

  beforeEach(() => {
    encryptorMock = {
      encryptText: jest.fn().mockResolvedValue(fakeEncryptedPat),
    };
    factory = new GithubTokenFactory();
  });

  describe('createToken()', () => {
    it('should create a valid GithubTokenDTO from valid inputs', async () => {
      const result = await factory.createToken(
        validUserId,
        validGithubId,
        validPat,
        encryptorMock,
      );

      expect(result).toBeInstanceOf(GithubTokenDTO);
      expect(result.userId).toBe(validUserId);
      expect(result.githubId).toBe(validGithubId);
      expect(result.encryptedPat).toBe(fakeEncryptedPat);
    });

    it('should call encryptText with the plain PAT value', async () => {
      await factory.createToken(
        validUserId,
        validGithubId,
        validPat,
        encryptorMock,
      );

      expect(encryptorMock.encryptText).toHaveBeenCalledTimes(1);
      expect(encryptorMock.encryptText).toHaveBeenCalledWith(validPat);
    });

    it('should throw if userId is not a valid UUID', async () => {
      await expect(
        factory.createToken('not-a-uuid', validGithubId, validPat, encryptorMock),
      ).rejects.toThrow();
    });

    it('should throw if githubId is not numeric', async () => {
      await expect(
        factory.createToken(validUserId, 'not-numeric', validPat, encryptorMock),
      ).rejects.toThrow();
    });

    it('should throw if githubId is empty', async () => {
      await expect(
        factory.createToken(validUserId, '', validPat, encryptorMock),
      ).rejects.toThrow();
    });

    it('should throw if PAT format is invalid', async () => {
      await expect(
        factory.createToken(validUserId, validGithubId, 'invalid-pat', encryptorMock),
      ).rejects.toThrow('PAT has an invalid format');
    });

    it('should throw if PAT is empty', async () => {
      await expect(
        factory.createToken(validUserId, validGithubId, '', encryptorMock),
      ).rejects.toThrow();
    });

    it('should not call encryptText if validation fails', async () => {
      await expect(
        factory.createToken(validUserId, validGithubId, 'invalid-pat', encryptorMock),
      ).rejects.toThrow();

      expect(encryptorMock.encryptText).not.toHaveBeenCalled();
    });

    it('should support github_pat_ format as valid PAT', async () => {
      const longPat = 'github_pat_' + 'a'.repeat(82);

      const result = await factory.createToken(
        validUserId,
        validGithubId,
        longPat,
        encryptorMock,
      );

      expect(result).toBeInstanceOf(GithubTokenDTO);
      expect(result.encryptedPat).toBe(fakeEncryptedPat);
    });
  });
});