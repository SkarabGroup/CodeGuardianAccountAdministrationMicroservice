import { User } from '../../domain/entities/user.entity';

export const UserSavePort = Symbol('IUserSavePort');

export interface IUserSavePort {
  save(user: User): Promise<void>;
}
