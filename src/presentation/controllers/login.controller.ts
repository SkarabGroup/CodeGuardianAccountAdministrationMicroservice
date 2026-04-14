import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
} from '@nestjs/common';
import { LoginRequestDto } from '../DTOs/request/login.dto'; // Quello senza le regole rigide sulla password
import {
  AuthResponseDto,
  UserResponseDto,
} from '../DTOs/response/auth-response.dto';
import type { IloginUseCase } from '../../application/use-cases/login.usecase';
import { LoginCommand } from '../../application/commands/login.command';
import { LOGIN_SERVICE } from '../../application/services/login.service';

@Controller('account/auth')
export class LoginController {
  constructor(
    @Inject(LOGIN_SERVICE)
    private readonly loginUseCase: IloginUseCase,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK) // Corretto per il login: 200 OK, non 201 Created
  async login(@Body() requestDto: LoginRequestDto): Promise<AuthResponseDto> {
    // 1. HTTP DTO -> Application Command
    const command = new LoginCommand(requestDto.email, requestDto.password);

    // 2. Esecuzione (Il controller non sa chi esegue, conosce solo l'interfaccia)
    const result = await this.loginUseCase.execute(command);

    // 3. Application Result -> HTTP DTO
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
