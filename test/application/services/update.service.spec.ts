import { Test, TestingModule } from '@nestjs/testing';
import { UpdateService } from '../../../src/application/services/update.service'; // Controlla il path
import { UpdateUserCommand } from '../../../src/application/commands/update.command';
import { User } from '../../../src/domain/entities/user.entity';
import { UserId } from '../../../src/domain/value-objects/user-id.vo';
import { Email } from '../../../src/domain/value-objects/email.vo';
import { PasswordHash } from '../../../src/domain/value-objects/password-hash.vo';
import type { IUserFindPort } from '../../../src/application/ports/IUserFind.port';
import type { IUserUpdatePort } from '../../../src/application/ports/IUserUpdate.port';
import type { ITokenProviderPort } from '../../../src/application/ports/ITokenProvider.port';
import type { IHashPasswordPort } from '../../../src/application/ports/IHashPassword.port';
import type { IHashComparePort } from '../../../src/application/ports/IHashCompare.port';
describe('UpdateService', () => {
  let updateService: UpdateService;
  const mockUserFindPort: jest.Mocked<IUserFindPort> = {
    find: jest.fn(),
  };

  const mockUserUpdatePort: jest.Mocked<IUserUpdatePort> = {
    update: jest.fn(),
  };

  const mockTokenProviderPort: jest.Mocked<ITokenProviderPort> = {
    generateToken: jest.fn(),
    generateRefreshToken: jest.fn(),
  };

  const mockHashPasswordPort: jest.Mocked<IHashPasswordPort> = {
    hash: jest.fn(),
  };
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
    mockUserFindPort.find.mockResolvedValueOnce(null);

    const command: UpdateUserCommand = {
      email: 'notfound@example.com',
      newPassword: 'SomePassword123!',
    };

    // Verifichiamo che il servizio lanci l'eccezione correttamente
    await expect(updateService.execute(command)).rejects.toThrow('User not found');
    
    // Verifichiamo che i servizi successivi NON vengano mai chiamati
    expect(mockHashPasswordPort.hash).not.toHaveBeenCalled();
    expect(mockUserUpdatePort.update).not.toHaveBeenCalled();
  });

  it('dovrebbe aggiornare la password, salvare l\'utente e restituire nuovi token', async () => {
    // Configurazione dei Mock per il percorso "Felice" (Happy Path)
    mockUserFindPort.find.mockResolvedValueOnce(testUser);
    
    const newPasswordPlain = 'NewSuperStrongPass!1';
    const newHashStr = '$2b$10$' + 'b'.repeat(53); // Un finto hash nuovo
    mockHashPasswordPort.hash.mockResolvedValueOnce(newHashStr);
    
    mockTokenProviderPort.generateToken.mockReturnValueOnce('new-access-token');
    mockTokenProviderPort.generateRefreshToken.mockReturnValueOnce('new-refresh-token');

    // Spionaggio: Vogliamo assicurarci che il metodo di dominio dell'Entità venga chiamato!
    const updatePasswordSpy = jest.spyOn(testUser, 'updatePassword');

    const command: UpdateUserCommand = {
      email: validEmailStr,
      newPassword: newPasswordPlain,
    };

    // Esecuzione
    const result = await updateService.execute(command);

    // Verifiche
    expect(mockUserFindPort.find).toHaveBeenCalledWith(validEmailStr);
    expect(mockHashPasswordPort.hash).toHaveBeenCalledWith(newPasswordPlain);
    
    // Controlliamo che l'Entità abbia fatto il suo lavoro di Dominio
    expect(updatePasswordSpy).toHaveBeenCalledTimes(1);
    expect(testUser.getPasswordHash().value).toBe(newHashStr); // Il nuovo hash deve essere nell'utente

    // L'utente aggiornato deve essere passato alla porta di Update
    expect(mockUserUpdatePort.update).toHaveBeenCalledWith(testUser);

    // Verifica generazione Token
    expect(mockTokenProviderPort.generateToken).toHaveBeenCalledWith({
      sub: validUuidV7,
      email: validEmailStr,
    });

    // Verifica della risposta finale
    expect(result.tokens.accessToken).toBe('new-access-token');
    expect(result.tokens.refreshToken).toBe('new-refresh-token');
    expect(result.user.email).toBe(validEmailStr);
    expect(result.user.id).toBe(validUuidV7);
  });

  it('dovrebbe aggiornare l\'utente senza modificare la password se newPassword non è fornita', async () => {
    mockUserFindPort.find.mockResolvedValueOnce(testUser);
    
    mockTokenProviderPort.generateToken.mockReturnValueOnce('new-access-token');
    mockTokenProviderPort.generateRefreshToken.mockReturnValueOnce('new-refresh-token');

    const updatePasswordSpy = jest.spyOn(testUser, 'updatePassword');

    // Comando SENZA newPassword
    const command: UpdateUserCommand = {
      email: validEmailStr,
      newPassword: '', // O undefined, a seconda di come gestisci l'assenza di password 
    };

    await updateService.execute(command);

    // Verifichiamo che la logica di hashing venga totalmente ignorata
    expect(mockHashPasswordPort.hash).not.toHaveBeenCalled();
    expect(updatePasswordSpy).not.toHaveBeenCalled();

    // Verifichiamo che l'aggiornamento e la generazione token avvengano comunque
    expect(mockUserUpdatePort.update).toHaveBeenCalledWith(testUser);
    expect(mockTokenProviderPort.generateToken).toHaveBeenCalled();
  });
});