import { DeleteCommand } from '../commands/delete.command';
import { DeleteResponseDto } from '../../presentation/DTOs/response/delete-response.dto';

export interface IDeleteUseCase {
  execute(command: DeleteCommand): Promise<DeleteResponseDto>;
}
