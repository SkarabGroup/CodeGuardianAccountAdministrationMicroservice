import { Test, TestingModule } from '@nestjs/testing';
import { LoginService } from '../../../src/application/services/login.service';
import { LoginCommand } from '../../../src/application/commands/login.command';
import { User } from '../../../src/domain/entities/user.entity';
describe('LoginService', () => {
  let service: LoginService;

  // 1. Mock delle porte aggiornati
  const mockUserFindPort = {
    find: jest.fn(),
  };

  const mockHashComparePort = {
    compare: jest.fn(),
  };

  const mockHashPasswordPort = {
    hash: jest.fn(),
  };

  const mockTokenProviderPort = {
    generateToken: jest.fn(),
  };

  const mockUser = {
    getPasswordHash: jest
      .fn()
      .mockReturnValue({ value: '$2b$10$mockedBcryptHashString' }),
    getUserId: jest
      .fn()
      .mockReturnValue({ value: '018e4567-e89b-7abc-8def-1234567890ab' }),
    getEmail: jest.fn().mockReturnValue({ value: 'test@example.com' }),
    toDTO: jest.fn().mockReturnValue({
      id: '018e4567-e89b-7abc-8def-1234567890ab',
      email: 'test@example.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }) as unknown as User,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginService,
        { provide: 'IUserFindPort', useValue: mockUserFindPort },
        { provide: 'IHashComparePort', useValue: mockHashComparePort },
        { provide: 'ITokenProviderPort', useValue: mockTokenProviderPort },
        { provide: 'IHashPasswordPort', useValue: mockHashPasswordPort },
      ],
    }).compile();

    service = module.get<LoginService>(LoginService);
  });

  it('dovrebbe essere definito', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    it("dovrebbe loggare l'utente e ritornare token e DTO se le credenziali sono corrette", async () => {
      const command: LoginCommand = {
        email: 'test@example.com',
        password: 'Password123!',
      };
      const expectedToken = 'jwt_access_token_mock';

      mockUserFindPort.find.mockResolvedValue(mockUser);
      // Mockiamo il compare in modo che restituisca TRUE
      mockHashComparePort.compare.mockResolvedValue(true);
      mockTokenProviderPort.generateToken.mockReturnValue(expectedToken);
      const result = await service.execute(command);
      expect(mockUserFindPort.find).toHaveBeenCalledWith(command.email);

      // Assicuriamoci che compare riceva la password in chiaro e l'hash salvato
      expect(mockHashComparePort.compare).toHaveBeenCalledWith(
        command.password,
        '$2b$10$mockedBcryptHashString',
      );

      expect(mockTokenProviderPort.generateToken).toHaveBeenCalledWith({
        sub: '018e4567-e89b-7abc-8def-1234567890ab',
        email: 'test@example.com',
      });

      expect(result.accessToken).toBe(expectedToken);
      expect(result.user).toEqual({
        id: '018e4567-e89b-7abc-8def-1234567890ab',
        email: 'test@example.com',
        createdAt: expect.any(String) as unknown as string,
        updatedAt: expect.any(String) as unknown as string,
      });
    });

    it("dovrebbe lanciare Errore se l'utente non esiste", async () => {
      const command: LoginCommand = {
        email: 'notfound@example.com',
        password: 'Password123!',
      };

      mockUserFindPort.find.mockResolvedValue(null);

      await expect(service.execute(command)).rejects.toThrow(
        'Invalid credentials',
      );

      expect(mockHashComparePort.compare).not.toHaveBeenCalled();
      expect(mockTokenProviderPort.generateToken).not.toHaveBeenCalled();
    });

    it('dovrebbe lanciare Errore se la password è sbagliata', async () => {
      const command: LoginCommand = {
        email: 'test@example.com',
        password: 'WrongPassword!',
      };
      mockUserFindPort.find.mockResolvedValue(mockUser);

      // Mockiamo il compare in modo che restituisca FALSE
      mockHashComparePort.compare.mockResolvedValue(false);
      await expect(service.execute(command)).rejects.toThrow(
        'Invalid credentials',
      );
      expect(mockTokenProviderPort.generateToken).not.toHaveBeenCalled();
    });
  });
});
