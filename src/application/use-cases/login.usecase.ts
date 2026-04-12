import { AuthResultDto } from '../DTOs/auth-result.dto';
import { LoginCommand } from '../commands/login.command';

export interface IloginUseCase {
  execute(command: LoginCommand): Promise<AuthResultDto>;
}
