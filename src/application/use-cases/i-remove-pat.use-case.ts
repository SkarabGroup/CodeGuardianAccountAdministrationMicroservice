import { RemovePatCommand } from '../commands/remove-pat-command.command';

export interface IRemovePatUseCase {
  removePat(command: RemovePatCommand): Promise<void>;
}
