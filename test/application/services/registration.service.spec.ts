import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationService } from '../../../src/application/services/registration.serivce';
import { RegistrationUserCommand } from '../../../src/application/commands/registration.command';
import { User } from '../../../src/domain/entities/user.entity';

jest.mock('uuid', () => ({
  v7: jest.fn().mockReturnValue('018e4567-e89b-7abc-8def-1234567890ab'),
}));

describe('RegistrationService', () => {
  let service: RegistrationService;

  const mockUserFindPort = {
    find: jest.fn(),
  };

  const mockUserSavePort = {
    save: jest.fn(),
  };

  const mockHashPasswordPort = {
    hash: jest.fn(),
  };

  const mockTokenProviderPort = {
    generateToken: jest.fn(),
  };

  beforeEach(async () => {
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
    it('dovrebbe registrare un nuovo user e restituire un jwt', async () => {
      const command: RegistrationUserCommand = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const hashedPassword = '$2b$10$abcdefghijklmnopqrstuv';
      const tokenMock = 'jwt_token_mock';
      const expectedUserId = '018e4567-e89b-7abc-8def-1234567890ab';
      const mockUserDto = {
        id: '018e4567-e89b-7abc-8def-1234567890ab',
        email: 'test@example.com',
      };

      mockHashPasswordPort.hash.mockResolvedValue(hashedPassword);
      mockUserFindPort.find.mockResolvedValue(null);
      mockUserSavePort.save.mockResolvedValue({
        ...mockUserDto,
        passwordHash: hashedPassword,
      });
      mockTokenProviderPort.generateToken.mockReturnValue(tokenMock);

      const result = await service.execute(command);

      //verifica che dsave sia stato chiamato con un istanza reale con mail giusta
      expect(mockUserFindPort.find).toHaveBeenCalledWith(command.email);
      expect(mockHashPasswordPort.hash).toHaveBeenCalledWith(command.password);
      expect(mockUserSavePort.save).toHaveBeenCalledTimes(1);
      const saveCalls = mockUserSavePort.save.mock.calls as unknown[][];
      const savedUserArgument = saveCalls[0][0] as User;
      expect(savedUserArgument).toBeInstanceOf(User);
      expect(savedUserArgument.getEmail().value).toBe(command.email);

      //verificare che payloadToken sia corretto
      expect(mockTokenProviderPort.generateToken).toHaveBeenCalledWith({
        sub: expectedUserId,
        email: command.email,
      });

      expect(result.accessToken).toBe(tokenMock);
      expect(result.user).toEqual({
        id: expectedUserId,
        email: command.email,
        createdAt: expect.any(String) as unknown as string,
        updatedAt: expect.any(String) as unknown as string,
      });

      const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
      expect(result.user.createdAt).toMatch(isoRegex);
      expect(result.user.updatedAt).toMatch(isoRegex);
    });

    it('dovrebbe lanciare un errore se l email è già in uso', async () => {
      const command: RegistrationUserCommand = {
        email: 'existingEmail@email.com',
        password: 'Password123!',
      };

      mockUserFindPort.find.mockResolvedValue({
        id: 'some-existing-id',
        email: command.email,
      });
      await expect(service.execute(command)).rejects.toThrow(
        'Email already in use',
      );

      expect(mockUserFindPort.find).toHaveBeenCalledWith(command.email);
      expect(mockHashPasswordPort.hash).not.toHaveBeenCalled();
      expect(mockUserSavePort.save).not.toHaveBeenCalled();
      expect(mockTokenProviderPort.generateToken).not.toHaveBeenCalled();
    });
  });
});
