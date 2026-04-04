import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IHashPasswordPort } from '../../application/ports/IHashPassword.port';
import { IHashComparePort } from 'src/application/ports/IHashCompare.port';

@Injectable()
export class BcryptService implements IHashPasswordPort, IHashComparePort {
  private readonly rounds = 10;

  async hash(plaintext: string): Promise<string> {
    return bcrypt.hash(plaintext, this.rounds);
  }

  async compare(plaintext: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plaintext, hash);
  }
}
