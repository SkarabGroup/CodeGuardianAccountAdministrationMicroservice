import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { JwtPayload } from '../../application/DTOs/jwt-payload.type';
import { ITokenProviderPort } from '../../application/ports/ITokenProvider.port';
import { IVerifyTokenPort } from '../../application/ports/IVerifyToken.port';

@Injectable()
export class JwtService implements ITokenProviderPort, IVerifyTokenPort {
  private readonly secret = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE3MTI1ODAwMDAsImV4cCI6MTk5OTk5OTk5OX0.MRBqWo8jM-R9JqrrZI6ShIoDzknxyukQngaNAvQ7m9U';
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
