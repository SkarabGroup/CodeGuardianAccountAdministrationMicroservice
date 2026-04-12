import { JwtPayload } from '../DTOs/jwt-payload.type';
export interface IVerifyTokenPort {
  verifyToken(token: string): JwtPayload | null;
}
