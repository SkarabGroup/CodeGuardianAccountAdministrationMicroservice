import { User } from '../../domain/entities/user.entity';
import { UserId }  from '../../domain/value-objects/user-id.vo';
export class AuthResponseDto {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
 
  static fromEntity(user: User): AuthResponseDto {
    const dto = new AuthResponseDto();
    dto.id = user.getUserId().value;
    dto.email = user.getEmail().value;
    dto.createdAt = user.getCreatedAt();
    return dto;
  }
}