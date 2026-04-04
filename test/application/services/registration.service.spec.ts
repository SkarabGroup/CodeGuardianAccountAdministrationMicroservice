import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationService } from '../../../src/application/services/registration.service';
import { RegistrationUserCommand } from '../../../src/application/commands/registration.command';
import { User } from '../../../src/domain/entities/user.entity';

// Mock di uuid: usiamo questo formato per assicurarci di intercettare l'export 'v7'
jest.mock('uuid', () => ({
  v7: jest.fn().mockReturnValue('018f5a2b-1234-7567-89ab-cdef01234567'),
}));

describe('RegistrationService', () => {
  let service: RegistrationService;

  // Mock delle porte
  const mockUserFindPort = { find: jest.fn() };
  const mockUserSavePort = { save: jest.fn() };
  const mockHashPasswordPort = { hash: jest.fn() };
  const mockTokenProviderPort = {
    generateToken: jest.fn(),
    generateRefreshToken: jest.fn(),
  };

  beforeEach(async () => {
    // Reset dei mock per evitare sovrapposizioni tra i test
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationService,
        { provide: 'IUserFindPort', useValue: mockUserFindPort },
        { provide: 'IUserSavePort', useValue: mockUserSavePort },
        { provide: 'IHashPasswordPort', useValue: mockHashPasswordPort },
        { provide: 'ITokenProviderPort', useValue: mockTokenProviderPort },
      ],
    }).compile();

    service = module.get<RegistrationService>(RegistrationService);
  });

  it('dovrebbe essere definito', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    
    // TEST 1: Il caso di successo (Happy Path) - Copre l'80% delle righe (24-58)
    it('dovrebbe registrare un nuovo utente e ritornare l\'AuthResultDto con i token', async () => {
      // Arrange
      const command: RegistrationUserCommand = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      // Configuriamo i mock per il caso in cui tutto va a buon fine
      mockUserFindPort.find.mockResolvedValue(null); // L'utente non esiste nel DB
      mockHashPasswordPort.hash.mockResolvedValue('$2b$10$FintaStringaBcryptPerSuperareIlTestDelValueObject123'); // La password viene hashata
      mockTokenProviderPort.generateToken.mockReturnValue('mock-access-token');
      mockTokenProviderPort.generateRefreshToken.mockReturnValue('mock-refresh-token');

      // Act
      const result = await service.execute(command);

      // Assert
      // 1. Verifichiamo le chiamate alle porte
      expect(mockUserFindPort.find).toHaveBeenCalledWith(command.email);
      expect(mockHashPasswordPort.hash).toHaveBeenCalledWith(command.password);
      
      // 2. Verifichiamo che l'utente sia stato salvato
      expect(mockUserSavePort.save).toHaveBeenCalledTimes(1);
      const savedUser = mockUserSavePort.save.mock.calls[0][0]; // Estraiamo l'oggetto passato al metodo save
      expect(savedUser).toBeInstanceOf(User); // Deve essere un'istanza dell'entità
      expect(savedUser.getEmail().value).toBe(command.email);
      expect(savedUser.getUserId().value).toBe('018f5a2b-1234-7567-89ab-cdef01234567'); // ID generato dal mock

      // 3. Verifichiamo la generazione dei token
      expect(mockTokenProviderPort.generateToken).toHaveBeenCalledWith({
        sub: '018f5a2b-1234-7567-89ab-cdef01234567',
        email: command.email,
      });

      // 4. Verifichiamo l'output finale
      expect(result).toBeDefined();
      expect(result.tokens.accessToken).toBe('mock-access-token');
      expect(result.tokens.refreshToken).toBe('mock-refresh-token');
      expect(result.user.id).toBe('018f5a2b-1234-7567-89ab-cdef01234567');
      expect(result.user.email).toBe(command.email);
    });

    // TEST 2: Il caso di fallimento - Copre le righe 21-22 (l'eccezione se l'utente esiste)
    it('dovrebbe lanciare un errore se l\'email è già in uso', async () => {
      // Arrange
      const command: RegistrationUserCommand = {
        email: 'existing@example.com',
        password: 'Password123!',
      };

      // Simuliamo che il database trovi già un utente
      mockUserFindPort.find.mockResolvedValue({ id: 'existing-id' });

      // Act & Assert
      // Ci aspettiamo che il metodo lanci esattamente questo errore
      await expect(service.execute(command)).rejects.toThrow('Email already in use');

      // Verifichiamo che il flusso si sia interrotto e NON abbia salvato o generato token
      expect(mockHashPasswordPort.hash).not.toHaveBeenCalled();
      expect(mockUserSavePort.save).not.toHaveBeenCalled();
      expect(mockTokenProviderPort.generateToken).not.toHaveBeenCalled();
    });
  });
});