export class Password {
  private readonly _value: string;

  private constructor(value: string) {
    this.validate(value);
    this._value = value;
  }

  public static create(value: string): Password {
    return new Password(value);
  }

  private validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('Password cannot be null, empty, or blank');
    }
    if (value.length < 8) {
      throw new Error('Password is not valid');
    }
    if (!/[A-Z]/.test(value)) {
      throw new Error('Password is not valid');
    }
    if (!/[a-z]/.test(value)) {
      throw new Error('Password is not valid');
    }
    if (!/[0-9]/.test(value)) {
      throw new Error('Password is not valid');
    }
    if (!/[^A-Za-z0-9]/.test(value)) {
      throw new Error('Password is not valid');
    }
  }

  public equals(other: Password): boolean {
    if (!(other instanceof Password)) return false;
    return this._value === other._value;
  }

  public get value(): string {
    return this._value;
  }
}
