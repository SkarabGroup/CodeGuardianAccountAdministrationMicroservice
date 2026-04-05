import { LogoutCommand } from '../commands/logout.command';

export interface ILogoutUseCase {
  execute(command: LogoutCommand): Promise<void>;
}
