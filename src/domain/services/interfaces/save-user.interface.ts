import { User } from 'src/domain/entities/user.entity';

export interface IUserSaveRepository {
    save(user: User): Promise<User>;
}