import { Injectable, Inject } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IHashPasswordPort } from '../../application/ports/IHashPassword.port';
import { IHashComparePort } from '../../application/ports/IHashCompare.port';

export const BCRYPT_ROUNDS_TOKEN = Symbol('BCRYPT_ROUNDS');

@Injectable()
export class BcryptService implements IHashPasswordPort, IHashComparePort {
  constructor(
    @Inject(BCRYPT_ROUNDS_TOKEN) private readonly rounds: number
  ){}

  async hash(plaintext: string): Promise<string> {
    return bcrypt.hash(plaintext, this.rounds);
  }

  async compare(plaintext: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plaintext, hash);
  }
}

export const BCRYPT_HASH_PORT = Symbol('IHashPasswordPort');
export const BCRYPT_COMPARE_PORT = Symbol('IHashComparePort');
