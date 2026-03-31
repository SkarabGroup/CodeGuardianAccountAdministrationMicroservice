import { UserDTO } from '../../../application/DTOs/user.dto';
export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserDTO;
}
