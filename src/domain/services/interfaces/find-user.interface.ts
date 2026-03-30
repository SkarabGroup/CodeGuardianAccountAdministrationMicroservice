import { User } from 'src/domain/entities/user.entity';
export interface IUserFindRepository{
    findByEmail(email: string): Promise<User | null>;
}