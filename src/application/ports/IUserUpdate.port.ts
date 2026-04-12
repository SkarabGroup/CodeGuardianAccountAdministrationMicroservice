import { User } from '../../domain/entities/user.entity';

export interface IUserUpdatePort {
  update(user: User): Promise<void>;
}
