import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { JwtPayload } from '../../DTOs/jwt-payload.type';

@Injectable()
export class JwtService {
  private readonly secret = process.env.JWT_SECRET ?? 'dev-secret-change-me';
  private readonly expiresIn = '2h';
 
  async generateToken(payload: JwtPayload): Promise<string> {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }
 
  async verifyToken(token: string): Promise<JwtPayload | null> {
    try {
      return jwt.verify(token, this.secret) as JwtPayload;
    } catch {
      return null;
    }
  }
}