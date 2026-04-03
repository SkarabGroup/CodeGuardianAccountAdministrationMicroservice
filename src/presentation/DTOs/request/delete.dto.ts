import { IsUUID } from 'class-validator';

export class DeleteDto {
  @IsUUID('all', { message: 'userToDelete must be a valid UUID' })
  userToDelete: string;
}
