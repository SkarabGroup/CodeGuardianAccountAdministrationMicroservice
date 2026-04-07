import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { JwtPayload } from '../../application/DTOs/jwt-payload.type';
import { ITokenProviderPort } from '../../application/ports/ITokenProvider.port';
import { IVerifyTokenPort } from '../../application/ports/IVerifyToken.port';

@Injectable()
export class JwtService implements ITokenProviderPort, IVerifyTokenPort {
  private readonly secret = process.env.JWT_SECRET ?? 'dev-secret-change-me';
  private readonly expiresIn = '2h';

  generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  generateRefreshToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: '7d' });
  }

  verifyToken(token: string): JwtPayload | null {
    try {
      return jwt.verify(token, this.secret) as JwtPayload;
    } catch {
      return null;
    }
  }
}

export const JWT_PROVIDER = Symbol('ITokenProviderPort');
export const JWT_VERIFIER = Symbol('IVerifyTokenPort');
