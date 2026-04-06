export interface ISessionPort {
  saveSession(
    userId: string,
    refreshToken: string,
    expiresAt: Date,
  ): Promise<void>;

  deleteSession(refreshToken: string): Promise<void>;

  isSessionValid(refreshToken: string): Promise<boolean>;
}
