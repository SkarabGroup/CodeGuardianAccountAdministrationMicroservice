import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Inject,
  Request as NestRequest,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import type { IDeleteUseCase } from '../../application/use-cases/delete.usecase';
import { DeleteCommand } from '../../application/commands/delete.command';
import { DeleteResponseDto } from '../DTOs/response/delete-response.dto';
import { JwtService } from '../../infrastructure/adapters/jwt.service';
import { DELETE_SERVICE } from '../../application/services/delete.service';

@Controller('account/users')
export class DeleteUserController {
  constructor(
    @Inject(DELETE_SERVICE) private readonly deleteUseCase: IDeleteUseCase,
    private readonly jwtService: JwtService,
  ) {}

  @Delete('me')
  @HttpCode(HttpStatus.OK)
  async delete(@NestRequest() req: Request): Promise<DeleteResponseDto> {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token missing or invalid');
    }

    const token = authHeader.split(' ')[1];

    let payload: ReturnType<typeof this.jwtService.verifyToken>;
    try {
      payload = this.jwtService.verifyToken(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    if (!payload) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const command = new DeleteCommand();
    command.userToDelete = payload.sub;

    return this.deleteUseCase.execute(command);
  }
}
