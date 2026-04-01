export const HASH_COMPARE_PORT = Symbol('IHashComparePort');

export interface IHashComparePort {
  compare(plaintext: string, hash: string): Promise<boolean>;
}
