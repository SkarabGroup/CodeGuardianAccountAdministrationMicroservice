export interface IHashPasswordPort {
  hash(plaintext: string): Promise<string>;
}
