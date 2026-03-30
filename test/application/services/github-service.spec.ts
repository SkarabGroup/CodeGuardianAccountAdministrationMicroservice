/* eslint-disable @typescript-eslint/unbound-method */
import { GitHubService } from '../../../src/application/services/github-service.service';
import { IGithubClientPort } from '../../../src/application/ports/i-github-client-port.port';
import { ISaveTokenPort } from '../../../src/application/ports/i-save-token-port.port';
import { IFindTokenByUserIdPort } from '../../../src/application/ports/i-find-token-by-user-id-port.port';
import { IDeleteTokenPort } from '../../../src/application/ports/i-delete-token-port.port';
import { IEncryptTextPort } from '../../../src/application/ports/i-encrypt-text-port.port';
import { GithubTokenFactory } from '../../../src/domain/factories/github-token-factory.factory';
import { GithubProfileDTO } from '../../../src/application/DTOs/github-profile-dto.dto';
import { GithubTokenDTO } from '../../../src/application/DTOs/github-token-dto.dto';
import { v4 as uuid } from 'uuid';

describe('GitHubService', () => {
  let service: GitHubService;
  let githubClientPort: jest.Mocked<IGithubClientPort>;
  let saveTokenPort: jest.Mocked<ISaveTokenPort>;
  let findTokenPort: jest.Mocked<IFindTokenByUserIdPort>;
  let deleteTokenPort: jest.Mocked<IDeleteTokenPort>;
  let encryptPort: jest.Mocked<IEncryptTextPort>;
  let tokenFactory: jest.Mocked<GithubTokenFactory>;

  const validUserId = uuid();
  const validPat = 'ghp_' + 'a'.repeat(36);

  const fakeProfile: GithubProfileDTO = {
    githubId: '221676739',
    email: 'test@github.com',
  };

  const fakeTokenDTO: GithubTokenDTO = {
    userId: validUserId,
    githubId: '221656539',
    encryptedPat: 'A'.repeat(64),
  };

  beforeEach(() => {
    githubClientPort = {
      validateAndGetProfile: jest.fn().mockResolvedValue(fakeProfile),
    };
    saveTokenPort = {
      saveToken: jest.fn().mockResolvedValue(undefined),
    };
    findTokenPort = {
      findByUserId: jest.fn().mockResolvedValue(null),
    };
    deleteTokenPort = {
      deleteToken: jest.fn().mockResolvedValue(undefined),
    };
    encryptPort = {
      encryptText: jest.fn().mockResolvedValue('A'.repeat(64)),
    };
    tokenFactory = {
      createToken: jest.fn().mockResolvedValue(fakeTokenDTO),
    } as unknown as jest.Mocked<GithubTokenFactory>;

    service = new GitHubService(
      githubClientPort,
      saveTokenPort,
      findTokenPort,
      deleteTokenPort,
      encryptPort,
      tokenFactory,
    );
  });

  describe('associatePat()', () => {
    it('should validate the PAT against GitHub API', async () => {
      const spy = jest.spyOn(githubClientPort, 'validateAndGetProfile');

      await service.associatePat(validUserId, validPat);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(validPat);
    });

    it('should save the token if no existing token is found', async () => {
      findTokenPort.findByUserId.mockResolvedValue(null);

      await service.associatePat(validUserId, validPat);

      expect(deleteTokenPort.deleteToken).not.toHaveBeenCalled();
      expect(tokenFactory.createToken).toHaveBeenCalledWith(
        validUserId,
        fakeProfile.githubId,
        validPat,
        encryptPort,
      );
      expect(saveTokenPort.saveToken).toHaveBeenCalledWith(fakeTokenDTO);
    });

    it('should delete existing token before saving a new one', async () => {
      findTokenPort.findByUserId.mockResolvedValue(fakeTokenDTO);

      await service.associatePat(validUserId, validPat);

      expect(deleteTokenPort.deleteToken).toHaveBeenCalledWith(validUserId);
      expect(saveTokenPort.saveToken).toHaveBeenCalledWith(fakeTokenDTO);
    });

    it('should call createToken with the githubId from the profile', async () => {
      await service.associatePat(validUserId, validPat);

      expect(tokenFactory.createToken).toHaveBeenCalledWith(
        validUserId,
        fakeProfile.githubId,
        validPat,
        encryptPort,
      );
    });

    it('should throw if GitHub API validation fails', async () => {
      githubClientPort.validateAndGetProfile.mockRejectedValue(
        new Error('Invalid PAT'),
      );

      await expect(service.associatePat(validUserId, validPat)).rejects.toThrow(
        'Invalid PAT',
      );
    });

    it('should not save token if GitHub API validation fails', async () => {
      githubClientPort.validateAndGetProfile.mockRejectedValue(
        new Error('Invalid PAT'),
      );

      await expect(
        service.associatePat(validUserId, validPat),
      ).rejects.toThrow();

      expect(saveTokenPort.saveToken).not.toHaveBeenCalled();
    });

    it('should not save token if createToken fails', async () => {
      tokenFactory.createToken.mockRejectedValue(
        new Error('Encryption failed'),
      );

      await expect(service.associatePat(validUserId, validPat)).rejects.toThrow(
        'Encryption failed',
      );

      expect(saveTokenPort.saveToken).not.toHaveBeenCalled();
    });

    it('should throw if deleteToken fails during associatePat', async () => {
      findTokenPort.findByUserId.mockResolvedValue(fakeTokenDTO);
      deleteTokenPort.deleteToken.mockRejectedValue(new Error('DB error'));

      await expect(service.associatePat(validUserId, validPat)).rejects.toThrow(
        'DB error',
      );

      expect(saveTokenPort.saveToken).not.toHaveBeenCalled();
    });
  });

  describe('removePat()', () => {
    it('should delete the token if it exists', async () => {
      findTokenPort.findByUserId.mockResolvedValue(fakeTokenDTO);

      await service.removePat(validUserId);

      expect(deleteTokenPort.deleteToken).toHaveBeenCalledWith(validUserId);
    });

    it('should throw if no token is found for the user', async () => {
      findTokenPort.findByUserId.mockResolvedValue(null);

      await expect(service.removePat(validUserId)).rejects.toThrow(
        `No GitHub token found for user ${validUserId}`,
      );
    });

    it('should not call deleteToken if no token is found', async () => {
      findTokenPort.findByUserId.mockResolvedValue(null);

      await expect(service.removePat(validUserId)).rejects.toThrow();

      expect(deleteTokenPort.deleteToken).not.toHaveBeenCalled();
    });

    it('should throw if deleteToken fails', async () => {
      findTokenPort.findByUserId.mockResolvedValue(fakeTokenDTO);
      deleteTokenPort.deleteToken.mockRejectedValue(new Error('DB error'));

      await expect(service.removePat(validUserId)).rejects.toThrow('DB error');
    });
  });
});
