export interface IHashComparePort {
  compare(plaintext: string, hash: string): Promise<boolean>;
}
