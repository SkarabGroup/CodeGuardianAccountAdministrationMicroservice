import { JwtPayload } from '../DTOs/jwt-payload.type';

export const TOKEN_PROVIDER_PORT = Symbol('TOKEN_PROVIDER_PORT');

export interface ITokenProviderPort {
  generateToken(payload: JwtPayload): string;
  generateRefreshToken(payload: JwtPayload): string;
}