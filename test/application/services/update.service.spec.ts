import { Test, TestingModule } from '@nestjs/testing';
import { UpdateService } from '../../../src/application/services/update.service';
import { UpdateUserCommand } from '../../../src/application/commands/update.command';
import { User } from '../../../src/domain/entities/user.entity';
import { UserId } from '../../../src/domain/value-objects/user-id.vo';
import { Email } from '../../../src/domain/value-objects/email.vo';
import { PasswordHash } from '../../../src/domain/value-objects/password-hash.vo';
import type { IUserFindPort } from '../../../src/application/ports/IUserFind.port';
import type { IUserUpdatePort } from '../../../src/application/ports/IUserUpdate.port';
import type { ITokenProviderPort } from '../../../src/application/ports/ITokenProvider.port';
import type { IHashPasswordPort } from '../../../src/application/ports/IHashPassword.port';
describe('UpdateService', () => {
  let updateService: UpdateService;

  // 🔥 TRUCCO ANTI-UNBOUND-METHOD:
  // Creiamo i mock come funzioni standalone prima di assegnarli alle interfacce
  const mockFind = jest.fn();
  const mockUpdate = jest.fn();
  const mockGenerateToken = jest.fn();
  const mockGenerateRefreshToken = jest.fn();
  const mockHash = jest.fn();

  // Assegniamo le funzioni standalone per rispettare le Ports
  const mockUserFindPort: IUserFindPort = { find: mockFind };
  const mockUserUpdatePort: IUserUpdatePort = { update: mockUpdate };
  const mockTokenProviderPort: ITokenProviderPort = {
    generateToken: mockGenerateToken,
    generateRefreshToken: mockGenerateRefreshToken,
  };
  const mockHashPasswordPort: IHashPasswordPort = {
    hash: mockHash,
  };


  // Dati di test validi
  const validEmailStr = 'test@example.com';
  const validUuidV7 = '018f4567-e89b-72d3-a456-426614174000';
  const oldHashStr = '$2b$10$' + 'a'.repeat(53);
  const now = new Date();

  let testUser: User;

  beforeEach(async () => {
    // Pulizia dei mock prima di ogni test
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateService,
        { provide: 'IUserFindPort', useValue: mockUserFindPort },
        { provide: 'IUserUpdatePort', useValue: mockUserUpdatePort },
        { provide: 'ITokenProviderPort', useValue: mockTokenProviderPort },
        { provide: 'IHashPasswordPort', useValue: mockHashPasswordPort },
      ],
    }).compile();

    updateService = module.get<UpdateService>(UpdateService);

    // Ricostituiamo un utente valido per i nostri test
    testUser = User.reconstitute(
      UserId.create(validUuidV7),
      Email.create(validEmailStr),
      PasswordHash.create(oldHashStr),
      now,
      now,
    );
  });

  it('dovrebbe lanciare un Errore se l\'utente non viene trovato', async () => {
    mockFind.mockResolvedValueOnce(null);

    const command: UpdateUserCommand = {
      email: 'notfound@example.com',
      newPassword: 'SomePassword123!',
    };

    await expect(updateService.execute(command)).rejects.toThrow('User not found');
    
    // Usiamo le variabili standalone nell'expect!
    expect(mockHash).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('dovrebbe aggiornare la password, salvare l\'utente e restituire nuovi token', async () => {
    mockFind.mockResolvedValueOnce(testUser);
    
    const newPasswordPlain = 'NewSuperStrongPass!1';
    const newHashStr = '$2b$10$' + 'b'.repeat(53);
    mockHash.mockResolvedValueOnce(newHashStr);
    
    mockGenerateToken.mockReturnValueOnce('new-access-token');
    mockGenerateRefreshToken.mockReturnValueOnce('new-refresh-token');

    const updatePasswordSpy = jest.spyOn(testUser, 'updatePassword');

    const command: UpdateUserCommand = {
      email: validEmailStr,
      newPassword: newPasswordPlain,
    };

    const result = await updateService.execute(command);

    expect(mockFind).toHaveBeenCalledWith(validEmailStr);
    expect(mockHash).toHaveBeenCalledWith(newPasswordPlain);
    
    expect(updatePasswordSpy).toHaveBeenCalledTimes(1);
    expect(testUser.getPasswordHash().value).toBe(newHashStr);

    expect(mockUpdate).toHaveBeenCalledWith(testUser);

    expect(mockGenerateToken).toHaveBeenCalledWith({
      sub: validUuidV7,
      email: validEmailStr,
    });

    expect(result.tokens.accessToken).toBe('new-access-token');
    expect(result.tokens.refreshToken).toBe('new-refresh-token');
    expect(result.user.email).toBe(validEmailStr);
    expect(result.user.id).toBe(validUuidV7);
  });

  it('dovrebbe aggiornare l\'utente senza modificare la password se newPassword non è fornita', async () => {
    mockFind.mockResolvedValueOnce(testUser);
    
    mockGenerateToken.mockReturnValueOnce('new-access-token');
    mockGenerateRefreshToken.mockReturnValueOnce('new-refresh-token');

    const updatePasswordSpy = jest.spyOn(testUser, 'updatePassword');

    const command: UpdateUserCommand = {
      email: validEmailStr,
      newPassword: '', // Password vuota, non dovrebbe triggerare l'update
    };

    await updateService.execute(command);

    expect(mockHash).not.toHaveBeenCalled();
    expect(updatePasswordSpy).not.toHaveBeenCalled();

    expect(mockUpdate).toHaveBeenCalledWith(testUser);
    expect(mockGenerateToken).toHaveBeenCalled();
  });
});