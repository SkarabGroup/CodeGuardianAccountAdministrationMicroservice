import { AuthResponseDto } from '../../presentation/DTOs/response/responseDTO';
import { RegistrationUserCommand } from '../commands/registration.command';

export interface IregistrationUseCase {
  execute(command: RegistrationUserCommand): Promise<AuthResponseDto>;
}
