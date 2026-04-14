import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
} from '@nestjs/common';
import { RegistrationDto } from '../DTOs/request/registration.dto';
import {
  AuthResponseDto,
  UserResponseDto,
} from '../DTOs/response/auth-response.dto';
import type { IregistrationUseCase } from '../../application/use-cases/registration.usecase';
import { RegistrationUserCommand } from '../../application/commands/registration.command';
import { REGISTRATION_SERVICE } from '../../application/services/registration.service';

@Controller('account/auth')
export class RegistrationController {
  constructor(
    @Inject(REGISTRATION_SERVICE)
    private readonly registrationUseCase: IregistrationUseCase,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() requestDto: RegistrationDto,
  ): Promise<AuthResponseDto> {
    // 1. INGRESSO: Mappiamo il DTO HTTP nel Command del caso d'uso
    const command: RegistrationUserCommand = {
      email: requestDto.email,
      password: requestDto.password,
    };

    // 2. ESECUZIONE: Chiamiamo l'interfaccia e otteniamo l'AuthResult (puro)
    const result = await this.registrationUseCase.execute(command);

    // 3. USCITA: Mapping manuale dall'AuthResult all'AuthResponseDto
    const response = new AuthResponseDto();
    response.accessToken = result.tokens.accessToken;
    response.refreshToken = result.tokens.refreshToken;

    const userResponse = new UserResponseDto();
    userResponse.id = result.user.id;
    userResponse.email = result.user.email;

    response.user = userResponse;

    return response;
  }
}
