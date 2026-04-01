import { JwtPayload } from '../DTOs/jwt-payload.type';

export const VERIFY_TOKEN_PORT = Symbol('IVerifyTokenPort');

export interface IVerifyTokenPort {
  verifyToken(token: string): JwtPayload | null;
}
