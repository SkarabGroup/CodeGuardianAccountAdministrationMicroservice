import { Inject, Injectable } from '@nestjs/common';
import { IDeleteUseCase } from '../use-cases/delete.usecase';
import { DeleteCommand } from '../commands/delete.command';
import { DeleteResponseDto } from '../../presentation/DTOs/response/delete-response.dto';
import type { IUserDeletePort } from '../ports/IUserDelete.port';

@Injectable()
export class DeleteService implements IDeleteUseCase {
  constructor(
    @Inject('IUserDeletePort') private readonly deletePort: IUserDeletePort,
  ) {}

  async execute(command: DeleteCommand): Promise<DeleteResponseDto> {
    await this.deletePort.deleteUser(command.userToDelete);

    const response = new DeleteResponseDto();
    response.deleted = true;

    return response;
  }
}

export const DELETE_SERVICE = Symbol('IDeleteService');
