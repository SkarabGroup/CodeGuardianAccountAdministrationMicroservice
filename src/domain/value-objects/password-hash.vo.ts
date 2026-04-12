export class PasswordHash {
  private readonly _value: string;

  private constructor(value: string) {
    this.validate(value);
    this._value = value;
  }

  public static create(value: string): PasswordHash {
    return new PasswordHash(value);
  }

  private validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('PasswordHash cannot be empty');
    }
    if (!value.startsWith('$2b$') && !value.startsWith('$2a$')) {
      throw new Error('PasswordHash is not a valid bcrypt hash');
    }
  }

  public equals(other: PasswordHash): boolean {
    if (!(other instanceof PasswordHash)) return false;
    return this._value === other._value;
  }

  public get value(): string {
    return this._value;
  }
}
