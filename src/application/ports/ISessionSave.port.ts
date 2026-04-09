export interface ISessionSavePort {
  saveSession(
    userId: string,
    refreshToken: string,
    expiresAt: Date,
  ): Promise<void>;
}
