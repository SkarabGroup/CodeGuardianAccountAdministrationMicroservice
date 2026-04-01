import { GithubTokenDTO } from '../DTOs/github-token-dto.dto';

export interface ISaveTokenPort {
  saveToken(token: GithubTokenDTO): Promise<void>;
}
