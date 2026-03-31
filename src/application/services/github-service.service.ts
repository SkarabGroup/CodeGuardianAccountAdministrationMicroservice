import { Injectable } from '@nestjs/common';
import { IAssociatePatUseCase } from '../use-cases/i-associate-pat.use-case';
import { IRemovePatUseCase } from '../use-cases/i-remove-pat.use-case';
import type { IGithubClientPort } from '../ports/i-github-client-port.port';
import type { ISaveTokenPort } from '../ports/i-save-token-port.port';
import type { IFindTokenByUserIdPort } from '../ports/i-find-token-by-user-id-port.port';
import type { IDeleteTokenPort } from '../ports/i-delete-token-port.port';
import type { IEncryptTextPort } from '../ports/i-encrypt-text-port.port';
import { GithubTokenFactory } from '../../domain/factories/github-token-factory.factory';
import { AssociatePatCommand } from '../commands/associate-pat-command.command';
import { RemovePatCommand } from '../commands/remove-pat-command.command';

@Injectable()
export class GitHubService implements IAssociatePatUseCase, IRemovePatUseCase {
  constructor(
    private readonly githubClientPort: IGithubClientPort,
    private readonly saveTokenPort: ISaveTokenPort,
    private readonly findTokenPort: IFindTokenByUserIdPort,
    private readonly deleteTokenPort: IDeleteTokenPort,
    private readonly encryptPort: IEncryptTextPort,
    private readonly tokenFactory: GithubTokenFactory,
  ) {}

  async associatePat(command: AssociatePatCommand): Promise<void> {
    const { userId, pat } = command;
    const profile = await this.githubClientPort.validateAndGetProfile(pat);

    const existingToken = await this.findTokenPort.findByUserId(userId);
    if (existingToken) {
      await this.deleteTokenPort.deleteToken(userId);
    }

    const tokenDTO = await this.tokenFactory.createToken(
      userId,
      profile.githubId,
      pat,
      this.encryptPort,
    );

    await this.saveTokenPort.saveToken(tokenDTO);
  }

  async removePat(command: RemovePatCommand): Promise<void> {
    const { userId } = command;
    const existingToken = await this.findTokenPort.findByUserId(userId);
    if (!existingToken) {
      throw new Error(`No GitHub token found for user ${userId}`);
    }

    await this.deleteTokenPort.deleteToken(userId);
  }
}
