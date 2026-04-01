import { AssociatePatCommand } from '../commands/associate-pat-command.command';

export interface IAssociatePatUseCase {
  associatePat(command: AssociatePatCommand): Promise<void>;
}
