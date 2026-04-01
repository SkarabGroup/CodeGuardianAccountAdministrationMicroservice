export interface IDeleteTokenPort {
  deleteToken(userId: string): Promise<void>;
}
