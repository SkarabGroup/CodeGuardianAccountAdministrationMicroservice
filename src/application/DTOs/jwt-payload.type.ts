export type JwtPayload = {
//sarebbe lo UUID
  sub: string;
  email: string;
  //createdat
  iat?: number
  //expiration;
  exp?: number;
};