import { Injectable, Inject } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { JwtPayload } from '../../application/DTOs/jwt-payload.type';
import { ITokenProviderPort } from '../../application/ports/ITokenProvider.port';
import { IVerifyTokenPort } from '../../application/ports/IVerifyToken.port';

export const JWT_SECRET_TOKEN = Symbol('JWT_SECRET');
export const JWT_EXPIRES_IN_TOKEN = Symbol('JWT_EXPIRES_IN');

@Injectable()
export class JwtService implements ITokenProviderPort, IVerifyTokenPort {
  constructor(
    @Inject(JWT_SECRET_TOKEN) private readonly secret: string,
    @Inject(JWT_EXPIRES_IN_TOKEN) private readonly expiresIn: string,
  ){}

  generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn as jwt.SignOptions['expiresIn'] });
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
