import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
 
@Injectable()
export class BcryptService {
  private readonly rounds = 10;
 
  async hash(plaintext: string): Promise<string> {
    return bcrypt.hash(plaintext, this.rounds);
  }
 
  async compare(plaintext: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plaintext, hash);
  }
}
