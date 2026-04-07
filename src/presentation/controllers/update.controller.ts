// src/presentation/controllers/update.controller.ts
import { Body, Controller, HttpCode, HttpStatus, Inject, Patch, Request as NestRequest, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { UpdateRequestDto } from '../DTOs/request/update.dto';
import { AuthResponseDto, UserResponseDto } from '../DTOs/response/auth-response.dto';
import type { IupdateUseCase } from '../../application/use-cases/update.usecase';
import { UpdateUserCommand } from '../../application/commands/update.command';
import { UPDATE_SERVICE } from '../../application/services/update.service';
import { JwtService } from '../../infrastructure/adapters/jwt.service'; // Aggiungi questo import

@Controller('auth')
export class UpdateController {
  constructor(
    @Inject(UPDATE_SERVICE) private readonly updateUseCase: IupdateUseCase,
    private readonly jwtService: JwtService, // <-- Inietta il JwtService
  ) {}

  @Patch('update')
  @HttpCode(HttpStatus.OK)
  async updatePassword(
    @NestRequest() req: Request, // <-- Aggiungiamo l'oggetto Request per leggere l'header
    @Body() requestDto: UpdateRequestDto,
  ): Promise<AuthResponseDto> {
    
    // 1. ESTRAZIONE E VERIFICA DEL TOKEN (Sicurezza!)
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

    if (!payload || !payload.email) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // 2. INGRESSO: Costruiamo il Command in modo sicuro!
    const command: UpdateUserCommand = {
      email: payload.email, // <-- PRESO DAL TOKEN, NON DAL BODY! A prova di hacker.
      newPassword: requestDto.newPassword,
    };

    // 3. ESECUZIONE
    const result = await this.updateUseCase.execute(command);

    // 4. USCITA (Mapping manuale)
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


