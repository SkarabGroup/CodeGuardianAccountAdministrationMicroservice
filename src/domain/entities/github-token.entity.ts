import { UserId } from '../value-objects/user-id.vo';
import { GithubId } from '../value-objects/github-id.vo';
import { EncryptedPat } from '../value-objects/encrypted-pat.vo';

export class GithubToken {
  private readonly _userId: UserId;
  private readonly _githubId: GithubId;
  private _encryptedPat: EncryptedPat;

  private constructor(
    userId: UserId,
    githubId: GithubId,
    encryptedPat: EncryptedPat,
  ) {
    this._userId = userId;
    this._githubId = githubId;
    this._encryptedPat = encryptedPat;
  }

  /* Primo collegamento github */
  public static create(
    userId: UserId,
    githubId: GithubId,
    encryptedPat: EncryptedPat,
  ): GithubToken {
    return new GithubToken(userId, githubId, encryptedPat);
  }

  public static reconstitute(
    userId: UserId,
    githubId: GithubId,
    encryptedPat: EncryptedPat,
  ): GithubToken {
    return new GithubToken(userId, githubId, encryptedPat);
  }

  public updatePat(newEncryptedPat: EncryptedPat): void {
    this._encryptedPat = newEncryptedPat;
  }

  public getUserId(): UserId {
    return this._userId;
  }

  public getGithubId(): GithubId {
    return this._githubId;
  }

  public getEncryptedPat(): EncryptedPat {
    return this._encryptedPat;
  }

  public equals(other: GithubToken): boolean {
    return other instanceof GithubToken && this._userId.equals(other._userId);
  }
}
