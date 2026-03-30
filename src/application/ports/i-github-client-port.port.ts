import { GithubProfileDTO } from '../DTOs/github-profile-dto.dto';

export interface IGithubClientPort {
  validateAndGetProfile(pat: string): Promise<GithubProfileDTO>;
}
