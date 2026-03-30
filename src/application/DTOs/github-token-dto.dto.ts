/* Token github per la persistenza */
/* extends AccountDTO */
export class GithubTokenDTO {
  userId: string;
  githubId: string;
  encryptedPat: string;
}
