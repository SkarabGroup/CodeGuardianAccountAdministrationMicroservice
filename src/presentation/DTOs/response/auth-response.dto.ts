import{ Expose, Type } from 'class-transformer';
export class UserResponseDto {
  @Expose()
  id!: string;

  @Expose()
  email!: string; 
}
export class AuthResponseDto {
  @Expose()
  accessToken!: string;
  @Expose()
  refreshToken!: string;
  @Expose()
  @Type(() => UserResponseDto)
  user!: UserResponseDto;
}
