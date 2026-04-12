import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
} from '@nestjs/common';
import { LOGOUT_SERVICE } from '../../application/services/logout.service';
import type { ILogoutUseCase } from '../../application/use-cases/logout.usecase';
import { LogoutCommand } from '../../application/commands/logout.command';
import { LogoutRequestDto } from '../DTOs/request/logout.dto';
import { LogoutResponseDto } from '../DTOs/response/logout-response.dto';

@Controller('auth')
export class LogoutController {
  constructor(
    @Inject(LOGOUT_SERVICE) private readonly logoutUseCase: ILogoutUseCase,
  ) {}

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Body() logoutDto: LogoutRequestDto,
  ): Promise<LogoutResponseDto> {
    const command = new LogoutCommand();
    command.refreshToken = logoutDto.refreshToken;

    await this.logoutUseCase.execute(command);

    return {
      message: 'Logged out successfully',
    };
  }
}
