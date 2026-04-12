import { AuthResultDto } from '../DTOs/auth-result.dto';
import { RegistrationUserCommand } from '../commands/registration.command';

export interface IregistrationUseCase {
  execute(command: RegistrationUserCommand): Promise<AuthResultDto>;
}
