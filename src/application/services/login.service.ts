import { LoginCommand } from '../commands/login.command';
import { Inject, Injectable } from '@nestjs/common';
import { AuthResultDto } from '../DTOs/auth-result.dto';
import type { IUserFindPort } from '../ports/IUserFind.port';
import type { ITokenProviderPort } from '../ports/ITokenProvider.port';
import type { IHashComparePort } from '../ports/IHashCompare.port';
import type { IloginUseCase } from '../use-cases/login.usecase';
import { InvalidCredentialsException } from '../exceptions/invalid-credentials.exception';

@Injectable()
export class LoginService implements IloginUseCase {
  constructor(
    @Inject('IUserFindPort') private readonly userFindPort: IUserFindPort,
    @Inject('ITokenProviderPort')
    private readonly tokenProviderPort: ITokenProviderPort,
    @Inject('IHashComparePort')
    private readonly hashComparePort: IHashComparePort,
  ) {}

  async execute(command: LoginCommand): Promise<AuthResultDto> {
    //1. check che lo user esista
    const user = await this.userFindPort.find(command.email);
    if (!user) {
      throw new InvalidCredentialsException();
    }

    //2. check che la password sia giusta
    const isPasswordValid = await this.hashComparePort.compare(
      command.password,
      user.getPasswordHash().value,
    );

    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    //3. generazione token
    const accessToken = this.tokenProviderPort.generateToken({
      sub: user.getUserId().value,
      email: user.getEmail().value,
    });
    const refreshToken = this.tokenProviderPort.generateRefreshToken({
      sub: user.getUserId().value,
      email: user.getEmail().value,
    });

    // 4. return rispostas
    return {
      tokens: {
        accessToken,
        refreshToken,
      },
      user: {
        id: user.getUserId().value,
        email: user.getEmail().value,
        createdAt: user.getCreatedAt().toString(),
        updatedAt: user.getUpdatedAt().toString(),
      },
    };
  }
}

export const LOGIN_SERVICE = Symbol('LoginService');
