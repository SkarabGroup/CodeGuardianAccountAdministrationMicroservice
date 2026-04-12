export class Username {
  private readonly _value: string;

  private constructor(value: string) {
    this.validate(value);
    this._value = value;
  }

  public static create(value: string): Username {
    return new Username(value);
  }

  private validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('Username cannot be null, empty, or blank');
    }
    if (value.length < 4 || value.length > 20) {
      throw new Error('Username is not valid');
    }
    if (!/^[a-zA-Z0-9]+$/.test(value)) {
      throw new Error('Username is not valid');
    }
  }

  public equals(other: Username): boolean {
    if (!(other instanceof Username)) return false;
    return this._value === other._value;
  }

  public get value(): string {
    return this._value;
  }
}
