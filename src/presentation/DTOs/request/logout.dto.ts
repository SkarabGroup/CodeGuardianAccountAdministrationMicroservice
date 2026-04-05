import { IsNotEmpty, IsString } from 'class-validator';

export class LogoutRequestDto {
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}
