import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IBcryptService } from '../interfaces/bcrypt.service.interface';

@Injectable()
export class BcryptService implements IBcryptService {
    private readonly saltRounds: number = 10;

    async hash(plain: string): Promise<string> {
        return await bcrypt.hash(plain, this.saltRounds);
    }

    async compare(plain: string, hashed: string): Promise<boolean> {
        return await bcrypt.compare(plain, hashed);
    }
}