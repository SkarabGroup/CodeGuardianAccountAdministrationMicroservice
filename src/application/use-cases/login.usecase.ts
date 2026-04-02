import { AuthResponseDto } from '../../presentation/DTOs/response/auth-response.dto';
import { LoginCommand } from '../commands/login.command';

export interface IloginUseCase {
  execute(command: LoginCommand): Promise<AuthResponseDto>;
}
