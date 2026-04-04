// src/application/services/login.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { LoginService } from '../../../src/application/services/login.service';
import { LoginCommand } from '../../../src/application/commands/login.command';

describe('LoginService', () => {
  let service: LoginService;

  // Mock delle porte in uscita (Outbound Ports)
  const mockUserFindPort = { find: jest.fn() };
  const mockTokenProviderPort = {
    generateToken: jest.fn(),
    generateRefreshToken: jest.fn(),
  };
  const mockHashComparePort = { compare: jest.fn() };

  // Creiamo un mock fittizio dell'entità User per simulare il ritorno dal DB
  const mockUser = {
    getUserId: () => ({ value: '123e4567-e89b-12d3-a456-426614174000' }),
    getEmail: () => ({ value: 'test@example.com' }),
    getPasswordHash: () => ({ value: 'hashed_password_from_db' }),
    getCreatedAt: () => new Date('2026-01-01T00:00:00Z'),
    getUpdatedAt: () => new Date('2026-01-01T00:00:00Z'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginService,
        { provide: 'IUserFindPort', useValue: mockUserFindPort },
        { provide: 'ITokenProviderPort', useValue: mockTokenProviderPort },
        { provide: 'IHashComparePort', useValue: mockHashComparePort },
      ],
    }).compile();

    service = module.get<LoginService>(LoginService);
  });

  it('dovrebbe essere definito', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    it('dovrebbe eseguire il login con successo e ritornare i token', async () => {
      // 1. Arrange
      const command = new LoginCommand('test@example.com', 'Password123!');

      mockUserFindPort.find.mockResolvedValue(mockUser);
      mockHashComparePort.compare.mockResolvedValue(true);
      mockTokenProviderPort.generateToken.mockReturnValue('mock-access-token');
      mockTokenProviderPort.generateRefreshToken.mockReturnValue('mock-refresh-token');

      // 2. Act
      const result = await service.execute(command);

      // 3. Assert
      expect(mockUserFindPort.find).toHaveBeenCalledWith(command.email);
      expect(mockHashComparePort.compare).toHaveBeenCalledWith(
        command.password,
        'hashed_password_from_db',
      );
      expect(mockTokenProviderPort.generateToken).toHaveBeenCalledWith({
        sub: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
      });

      expect(result.tokens.accessToken).toBe('mock-access-token');
      expect(result.tokens.refreshToken).toBe('mock-refresh-token');
      expect(result.user.id).toBe('123e4567-e89b-12d3-a456-426614174000');
    });

    it('dovrebbe lanciare errore se l\'utente non esiste', async () => {
      const command = new LoginCommand('notfound@example.com', 'Password123!');
      
      mockUserFindPort.find.mockResolvedValue(null); // Utente non trovato

      await expect(service.execute(command)).rejects.toThrow('Invalid credentials');
      
      // Assicuriamoci che non provi nemmeno a comparare la password o generare token
      expect(mockHashComparePort.compare).not.toHaveBeenCalled();
      expect(mockTokenProviderPort.generateToken).not.toHaveBeenCalled();
    });

    it('dovrebbe lanciare errore se la password è errata', async () => {
      const command = new LoginCommand('test@example.com', 'WrongPassword!');
      
      mockUserFindPort.find.mockResolvedValue(mockUser);
      mockHashComparePort.compare.mockResolvedValue(false); // Password errata

      await expect(service.execute(command)).rejects.toThrow('Invalid credentials');
      expect(mockTokenProviderPort.generateToken).not.toHaveBeenCalled();
    });
  });
});