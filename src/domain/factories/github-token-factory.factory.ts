import { GithubTokenDTO } from '../../application/DTOs/github-token-dto.dto';
import { IEncryptTextPort } from '../../application/ports/i-encrypt-text-port.port';
import { UserId } from '../value-objects/user-id.vo';
import { GithubId } from '../value-objects/github-id.vo';
import { PersonalAccessToken } from '../value-objects/personal-access-token.vo';

export class GithubTokenFactory {
  async createToken(
    userId: string,
    githubId: string,
    pat: string,
    encryptor: IEncryptTextPort,
  ): Promise<GithubTokenDTO> {
    const validUserId = UserId.create(userId);
    const validGithubId = GithubId.create(githubId);
    const validPat = PersonalAccessToken.create(pat);

    const encryptedPat = await encryptor.encryptText(validPat.value);

    const dto = new GithubTokenDTO();
    dto.userId = validUserId.value;
    dto.githubId = validGithubId.value;
    dto.encryptedPat = encryptedPat;

    return dto;
  }
}
