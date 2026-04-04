import { Test, TestingModule } from '@nestjs/testing';
import { LoginController } from '../../src/presentation/controllers/login.controller';
import { LOGIN_SERVICE } from '../../src/application/services/login.service';
import { LoginRequestDto } from '../../src/presentation/DTOs/request/login.dto';
import { LoginCommand } from '../../src/application/commands/login.command';
import { AuthResponseDto } from '../../src/presentation/DTOs/response/auth-response.dto';

describe('LoginController', () => {
  let controller: LoginController;

  // Creiamo un mock del caso d'uso
  const mockLoginUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoginController],
      providers: [
        {
          provide: LOGIN_SERVICE, // Usiamo lo stesso token del controller
          useValue: mockLoginUseCase,
        },
      ],
    }).compile();

    controller = module.get<LoginController>(LoginController);
  });

  it('dovrebbe essere definito', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('dovrebbe mappare il DTO, eseguire il caso d\'uso e restituire l\'AuthResponseDto corretto', async () => {
      // 1. Arrange: Prepariamo i dati di input e il finto output del caso d'uso
      const requestDto: LoginRequestDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const mockAuthResult = {
        tokens: {
          accessToken: 'mocked-access-token',
          refreshToken: 'mocked-refresh-token',
        },
        user: {
          id: '123-uuid',
          email: 'test@example.com',
        },
      };

      // Istruiamo il mock a restituire il nostro risultato
      mockLoginUseCase.execute.mockResolvedValue(mockAuthResult);

      // 2. Act: Chiamiamo il metodo del controller
      const result: AuthResponseDto = await controller.login(requestDto);

      // 3. Assert: Verifichiamo che il caso d'uso sia stato chiamato con il Command corretto
      // Controlliamo che l'oggetto passato a execute sia un'istanza di LoginCommand con i dati giusti
      expect(mockLoginUseCase.execute).toHaveBeenCalledTimes(1);
      const calls = mockLoginUseCase.execute.mock.calls as unknown as [LoginCommand][];
      const calledCommand = calls[0][0];      
      expect(calledCommand).toBeInstanceOf(LoginCommand);
      expect(calledCommand.email).toBe(requestDto.email);
      expect(calledCommand.password).toBe(requestDto.password);

      // Verifichiamo che la risposta sia mappata correttamente nell'AuthResponseDto
      expect(result).toBeInstanceOf(AuthResponseDto);
      expect(result.accessToken).toBe('mocked-access-token');
      expect(result.refreshToken).toBe('mocked-refresh-token');
      expect(result.user.id).toBe('123-uuid');
      expect(result.user.email).toBe('test@example.com');
    });

    it('dovrebbe propagare le eccezioni lanciate dal caso d\'uso', async () => {
      // Arrange
      const requestDto: LoginRequestDto = {
        email: 'test@example.com',
        password: 'WrongPassword!',
      };
      
      const error = new Error('Credenziali non valide');
      mockLoginUseCase.execute.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.login(requestDto)).rejects.toThrow('Credenziali non valide');
    });
  });
});