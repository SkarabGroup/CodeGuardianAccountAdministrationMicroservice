import { IupdateUseCase } from '../use-cases/update.usecase';
import { UpdateUserCommand } from '../commands/update.command';
import { Inject, Injectable } from '@nestjs/common';
import type { IUserFindPort } from '../ports/IUserFind.port';
import type { IUserUpdatePort } from '../ports/IUserUpdate.port';
import type { ITokenProviderPort } from '../ports/ITokenProvider.port';
import type { IHashPasswordPort } from '../ports/IHashPassword.port';
import { AuthResultDto } from '../DTOs/auth-result.dto';
import { PasswordHash } from '../../domain/value-objects/password-hash.vo'; // <-- Corretto l'import

@Injectable()
export class UpdateService implements IupdateUseCase {
  constructor(
    @Inject('IUserFindPort') private readonly userFindPort: IUserFindPort,
    @Inject('IUserUpdatePort') private readonly userUpdatePort: IUserUpdatePort,
    @Inject('ITokenProviderPort')
    private readonly tokenProviderPort: ITokenProviderPort,
    @Inject('IHashPasswordPort')
    private readonly hashPasswordPort: IHashPasswordPort,
  ) {}

  async execute(command: UpdateUserCommand): Promise<AuthResultDto> {
    // 1. Check che lo user esista
    const user = await this.userFindPort.find(command.email);
    if (!user) {
      throw new Error('User not found');
    }

    // 2. Aggiorna l'entità
    if (command.newPassword) {
      const hashedString = await this.hashPasswordPort.hash(
        command.newPassword,
      );
      const newPasswordHash = PasswordHash.create(hashedString);
      user.updatePassword(newPasswordHash);
    }

    // 3. Salva le modifiche
    await this.userUpdatePort.update(user);

    // 4. Generazione token aggiornato
    const accessToken = this.tokenProviderPort.generateToken({
      sub: user.getUserId().value,
      email: user.getEmail().value,
    });
    const refreshToken = this.tokenProviderPort.generateRefreshToken({
      sub: user.getUserId().value,
      email: user.getEmail().value,
    });

    // 5. Return risposta
    return {
      tokens: {
        accessToken: accessToken,
        refreshToken: refreshToken,
      },
      user: user.toDTO(),
    };
  }
}

export const UPDATE_SERVICE = Symbol('UpdateService');
