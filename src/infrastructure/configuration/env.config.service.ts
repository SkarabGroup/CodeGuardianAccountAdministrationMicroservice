import type { AppConfig } from './env.config.type'; 

export function loadConfig(): AppConfig {
  return {
    server: {
      port: parseInt(process.env.PORT ?? '3000', 10),
    },
    db: {
      url: process.env.DATABASE_URL ?? throwError('DATABASE_URL mancante'),
    },
    security: {
      jwtSecret: process.env.JWT_SECRET ?? throwError('JWT_SECRET mancante'),
      jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
      bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS ?? '10', 10),
    }
  };
}

function throwError(msg: string): never {
  throw new Error(msg);
}