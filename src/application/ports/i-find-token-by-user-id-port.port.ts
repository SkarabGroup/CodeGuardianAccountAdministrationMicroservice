import { GithubTokenDTO } from '../DTOs/github-token-dto.dto';

export interface IFindTokenByUserIdPort {
  findByUserId(userId: string): Promise<GithubTokenDTO | null>;
}
