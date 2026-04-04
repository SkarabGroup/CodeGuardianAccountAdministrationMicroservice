import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import type { IDeleteUseCase } from '../../application/use-cases/delete.usecase';
import { DeleteDto } from '../DTOs/request/delete.dto';
import { DeleteCommand } from '../../application/commands/delete.command';
import { DeleteResponseDto } from '../DTOs/response/delete-response.dto';

@Controller('users')
export class DeleteUserController {
  constructor(
    @Inject('IDeleteUseCase') private readonly deleteUseCase: IDeleteUseCase,
  ) {}

  @Delete()
  @HttpCode(HttpStatus.OK)
  async delete(@Body() dto: DeleteDto): Promise<DeleteResponseDto> {
    const command = new DeleteCommand();
    command.userToDelete = dto.userToDelete;

    return this.deleteUseCase.execute(command);
  }
}
