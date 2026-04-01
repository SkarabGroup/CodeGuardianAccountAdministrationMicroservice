export const PASSWORD_HASHER_PORT = Symbol('PASSWORD_HASHER_PORT');

export interface IHashPasswordPort {
  hash(plaintext: string): Promise<string>;
}
