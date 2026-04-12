export type AppConfig = {
  server: {
    port: number;
  }
  db: {
    url: string;
  };
  security: {
    jwtSecret: string;
    jwtExpiresIn: string;
    bcryptRounds: number;
  };
};