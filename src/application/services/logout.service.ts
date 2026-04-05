import { Inject, Injectable } from '@nestjs/common';
import { ILogoutUseCase } from '../use-cases/logout.usecase';
import { LogoutCommand } from '../commands/logout.command';
import type { ISessionPort } from '../ports/ISession.port';

@Injectable()
export class LogoutService implements ILogoutUseCase {
  constructor(
    @Inject('ISessionPort')
    private readonly sessionPort: ISessionPort,
  ) {}

  async execute(command: LogoutCommand): Promise<void> {
    await this.sessionPort.deleteSession(command.refreshToken);
  }
}

export const LOGOUT_SERVICE = Symbol('LogoutService');
