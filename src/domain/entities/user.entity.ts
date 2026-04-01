import { UserId } from '../value-objects/user-id.vo';
import { Email } from '../value-objects/email.vo';
import { PasswordHash } from '../value-objects/password-hash.vo';

export class User {
  private readonly _userId: UserId;
  private readonly _email: Email;
  private _passwordHash: PasswordHash;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(
    userId: UserId,
    email: Email,
    passwordHash: PasswordHash,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this._userId = userId;
    this._email = email;
    this._passwordHash = passwordHash;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  /* Usato quando si registra un nuovo utente */
  public static create(id: UserId,email: Email, passwordHash: PasswordHash): User {
    const now = new Date();
    return new User(id, email, passwordHash, now, now);
  }

  /* Usato quando viene letto un utente dal database */
  public static reconstitute(
    userId: UserId,
    email: Email,
    passwordHash: PasswordHash,
    createdAt: Date,
    updatedAt: Date,
  ): User {
    return new User(userId, email, passwordHash, createdAt, updatedAt);
  }

  public updatePassword(newPasswordHash: PasswordHash): void {
    this._passwordHash = newPasswordHash;
    this._updatedAt = new Date();
  }

  public getUserId(): UserId {
    return this._userId;
  }

  public getEmail(): Email {
    return this._email;
  }

  public getPasswordHash(): PasswordHash {
    return this._passwordHash;
  }

  public getCreatedAt(): Date {
    return this._createdAt;
  }

  public getUpdatedAt(): Date {
    return this._updatedAt;
  }

  public equals(other: User): boolean {
    return other instanceof User && this._userId.equals(other._userId);
  }
}
