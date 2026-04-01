import { User } from '../../domain/entities/user.entity';

export const UserFindPort = Symbol('IUserFindPort');

export interface IUserFindPort {
  find(email: string): Promise<User | null>;
}
