import { User } from '../../domain/entities/user.entity';
export interface IUserFindPort {
  find(email: string): Promise<User | null>;
}
