import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationController } from '../../src/presentation/controllers/registration.controller';
import { REGISTRATION_SERVICE } from '../../src/application/services/registration.service';
import { RegistrationDto } from '../../src/presentation/DTOs/request/registration.dto';
import { AuthResponseDto } from '../../src/presentation/DTOs/response/auth-response.dto';

describe('RegistrationController', () => {
  let controller: RegistrationController;

  // Mock del caso d'uso di registrazione
  const mockRegistrationUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegistrationController],
      providers: [
        {
          provide: REGISTRATION_SERVICE, // Token di iniezione
          useValue: mockRegistrationUseCase,
        },
      ],
    }).compile();

    controller = module.get<RegistrationController>(RegistrationController);
  });

  it('dovrebbe essere definito', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('dovrebbe mappare il DTO, eseguire il caso d\'uso e restituire l\'AuthResponseDto corretto', async () => {
      // 1. Arrange
      const requestDto: RegistrationDto = {
        email: 'newuser@example.com',
        password: 'StrongPassword123!',
      };

      const mockAuthResult = {
        tokens: {
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
        },
        user: {
          id: 'new-uuid-456',
          email: 'newuser@example.com',
        },
      };

      mockRegistrationUseCase.execute.mockResolvedValue(mockAuthResult);

      // 2. Act
      const result: AuthResponseDto = await controller.register(requestDto);

      // 3. Assert
      // Verifica che il comando sia stato passato correttamente
      expect(mockRegistrationUseCase.execute).toHaveBeenCalledTimes(1);
      expect(mockRegistrationUseCase.execute).toHaveBeenCalledWith({
        email: requestDto.email,
        password: requestDto.password,
      });

      // Verifica il mapping dei dati in uscita
      expect(result).toBeInstanceOf(AuthResponseDto);
      expect(result.accessToken).toBe('new-access-token');
      expect(result.refreshToken).toBe('new-refresh-token');
      expect(result.user.id).toBe('new-uuid-456');
      expect(result.user.email).toBe('newuser@example.com');
    });

    it('dovrebbe propagare le eccezioni se la registrazione fallisce (es. utente esistente)', async () => {
      // Arrange
      const requestDto: RegistrationDto = {
        email: 'existing@example.com',
        password: 'Password123!',
      };

      const error = new Error('Email già in uso');
      mockRegistrationUseCase.execute.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.register(requestDto)).rejects.toThrow('Email già in uso');
    });
  });
});