import { AuthResponseDto } from '../../presentation/DTOs/response/auth-response.dto';
import { RegistrationUserCommand } from '../commands/registration.command';

export interface IregistrationUseCase {
  execute(command: RegistrationUserCommand): Promise<AuthResponseDto>;
}
