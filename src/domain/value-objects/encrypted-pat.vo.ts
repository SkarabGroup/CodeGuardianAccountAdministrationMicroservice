export class EncryptedPat {
  private readonly _value: string;

  private constructor(value: string) {
    this.validate(value);
    this._value = value;
  }

  public static create(value: string): EncryptedPat {
    return new EncryptedPat(value);
  }

  public get value(): string {
    return this._value;
  }

  private validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('EncryptedPat cannot be null, empty, or blank');
    }
    const base64Pattern = /^[A-Za-z0-9+/]+=*$/;
    if (!base64Pattern.test(value)) {
      throw new Error('EncryptedPat must be a valid base64-encoded string');
    }
    if (value.length < 32) {
      throw new Error('EncryptedPat is too short to be a valid encrypted token');
    }
  }

  public equals(other: EncryptedPat): boolean {
    return other instanceof EncryptedPat && this._value === other._value;
  }
}
