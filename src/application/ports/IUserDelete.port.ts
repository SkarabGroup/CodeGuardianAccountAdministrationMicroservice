export interface IUserDeletePort {
  deleteUser(userId: string): Promise<void>;
}
