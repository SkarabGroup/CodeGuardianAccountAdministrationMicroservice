export class GithubId {
  private readonly _value: string;

  private constructor(value: string) {
    this.validate(value);
    this._value = value;
  }

  public static create(value: string): GithubId {
    return new GithubId(value);
  }

  public get value(): string {
    return this._value;
  }

  private validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('GithubId cannot be null, empty, or blank');
    }
    const pattern = /^\d{1,50}$/;
    if (!pattern.test(value)) {
      throw new Error(
        'GithubId must be a non-empty numeric string (max 50 digits)',
      );
    }
  }

  public equals(other: GithubId): boolean {
    return other instanceof GithubId && this._value === other._value;
  }
}
