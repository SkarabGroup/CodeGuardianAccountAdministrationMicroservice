import { AuthResultDto } from '../DTOs/auth-result.dto';
import { UpdateUserCommand } from '../commands/update.command';

export interface IupdateUseCase {
  execute(command: UpdateUserCommand): Promise<AuthResultDto>;
}
