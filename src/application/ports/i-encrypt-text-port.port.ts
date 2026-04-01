export interface IEncryptTextPort {
  encryptText(plainText: string): Promise<string>;
}
