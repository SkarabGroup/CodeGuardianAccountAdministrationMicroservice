import { JwtPayload } from '../DTOs/jwt-payload.type';
export interface ITokenProviderPort {
  generateToken(payload: JwtPayload): string;
  generateRefreshToken(payload: JwtPayload): string;
}
