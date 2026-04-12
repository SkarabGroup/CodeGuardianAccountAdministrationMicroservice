import { User } from '../../domain/entities/user.entity';
export interface IUserSavePort {
  save(user: User): Promise<void>;
}
