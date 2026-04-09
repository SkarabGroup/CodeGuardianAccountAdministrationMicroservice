export interface ISessionDeletePort {
  deleteSession(refreshToken: string): Promise<void>;
}
