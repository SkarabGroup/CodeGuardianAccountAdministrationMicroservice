export class Email {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = this.validate(value);
  }

  public static create(value: string): Email {
    return new Email(value);
  }

  private validate(value: string): string {
    if (!value || value.trim().length === 0) {
      throw new Error('Email cannot be null, empty, or blank');
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const normalized = value.toLowerCase().trim();
    if (!emailPattern.test(normalized)) {
      throw new Error('Email is not valid');
    }
    return normalized;
  }

  public equals(other: Email): boolean {
    if (!(other instanceof Email)) return false;
    return this._value === other._value;
  }

  public get value(): string {
    return this._value;
  }
}
