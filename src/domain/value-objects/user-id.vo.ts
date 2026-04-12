export class UserId {
  private readonly _value: string;

  private constructor(value: string) {
    this.validate(value);
    this._value = value;
  }

  public static create(value: string): UserId {
    return new UserId(value);
  }

  public static generate(value: string): UserId {
    return new UserId(value);
  }

  private validate(value: string): void {
    const uuidV7Regex =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-7[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
    if (!uuidV7Regex.test(value)) {
      throw new Error('UUID non valido!');
    }
  }

  public equals(other: UserId): boolean {
    if (!(other instanceof UserId)) return false;
    return this._value === other._value;
  }

  public get value(): string {
    return this._value;
  }
}
