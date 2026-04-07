// test/presentation/controllers/update.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { UpdateController } from '../../../src/presentation/controllers/update.controller';
import { UPDATE_SERVICE } from '../../../src/application/services/update.service';
import type { IupdateUseCase } from '../../../src/application/use-cases/update.usecase';
import { JwtService } from '../../../src/infrastructure/adapters/jwt.service';
import { UpdateRequestDto } from '../../../src/presentation/DTOs/request/update.dto';
import { AuthResultDto } from '../../../src/application/DTOs/auth-result.dto';
import { AuthResponseDto, UserResponseDto } from '../../../src/presentation/DTOs/response/auth-response.dto';
import type { UpdateUserCommand } from '../../../src/application/commands/update.command';

describe('UpdateController', () => {
  let controller: UpdateController;

  // 1. Mock rigoroso per il Use Case
  const mockUpdateUseCase: jest.Mocked<IupdateUseCase> = {
    execute: jest.fn(),
  };

  // 2. Mock per il JwtService
  const mockJwtService = {
    verifyToken: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UpdateController],
      providers: [
        {
          provide: UPDATE_SERVICE,
          useValue: mockUpdateUseCase,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    controller = module.get<UpdateController>(UpdateController);
  });

  it('dovrebbe essere definito', () => {
    expect(controller).toBeDefined();
  });

  describe('updatePassword()', () => {
    const validEmail = 'secure@example.com';
    const validToken = 'valid.jwt.token';

    // Helper per creare una Request tipizzata
    const createMockRequest = (authHeader?: string): Request => {
      return {
        headers: {
          authorization: authHeader,
        },
      } as unknown as Request;
    };

    it('dovrebbe lanciare UnauthorizedException se manca l\'header authorization', async () => {
      const req = createMockRequest(undefined);
      const dto: UpdateRequestDto = { newPassword: 'NewPassword123!' };
      
      await expect(controller.updatePassword(req, dto)).rejects.toThrow(UnauthorizedException);
    });

    it('dovrebbe lanciare UnauthorizedException se il token non è valido', async () => {
      const req = createMockRequest('Bearer bad.token');
      const dto: UpdateRequestDto = { newPassword: 'NewPassword123!' };
      
      mockJwtService.verifyToken.mockImplementationOnce(() => {
        throw new Error('Invalid signature');
      });

      await expect(controller.updatePassword(req, dto)).rejects.toThrow(UnauthorizedException);
    });

    it('dovrebbe lanciare UnauthorizedException se il token non contiene l\'email', async () => {
      const req = createMockRequest(`Bearer ${validToken}`);
      const dto: UpdateRequestDto = { newPassword: 'NewPassword123!' };
      
      // Manca l'email nel payload finto
      mockJwtService.verifyToken.mockReturnValueOnce({ sub: '123' });

      await expect(controller.updatePassword(req, dto)).rejects.toThrow(UnauthorizedException);
    });

    it('dovrebbe mappare il DTO e il Token nel Command, chiamare il caso d\'uso e mappare la risposta', async () => {
      // 1. INGRESSO
      const req = createMockRequest(`Bearer ${validToken}`);
      const requestDto: UpdateRequestDto = {
        newPassword: 'NewPassword123!',
      };

      // Simuliamo la lettura del token con successo
      mockJwtService.verifyToken.mockReturnValueOnce({ sub: '123e4567', email: validEmail });

      // 2. ESECUZIONE (Risultato finto dal service)
      const mockAuthResult: AuthResultDto = {
        tokens: {
          accessToken: 'fake-access-token',
          refreshToken: 'fake-refresh-token',
        },
        user: {
          id: '123e4567-e89b-72d3-a456-426614174000',
          email: validEmail,
          createdAt: new Date().toISOString(),  
          updatedAt: new Date().toISOString(), 
        },
      };

      mockUpdateUseCase.execute.mockResolvedValueOnce(mockAuthResult);

      // 3. Chiamata effettiva al controller
      const result = await controller.updatePassword(req, requestDto);

      // 4. Verifiche: il Command deve unire Email (dal token) e Password (dal body)
      expect(mockJwtService.verifyToken).toHaveBeenCalledWith(validToken);
      expect(mockUpdateUseCase.execute).toHaveBeenCalledTimes(1);
      
      const passedCommand = mockUpdateUseCase.execute.mock.calls[0][0] as UpdateUserCommand;
      expect(passedCommand.email).toBe(validEmail);
      expect(passedCommand.newPassword).toBe('NewPassword123!');

      // 5. Verifica dell'uscita
      expect(result).toBeInstanceOf(AuthResponseDto);
      expect(result.accessToken).toBe('fake-access-token');
      expect(result.user).toBeInstanceOf(UserResponseDto);
      expect(result.user.email).toBe(validEmail);
    });

    it('dovrebbe propagare correttamente le eccezioni del Service', async () => {
      const req = createMockRequest(`Bearer ${validToken}`);
      const dto: UpdateRequestDto = { newPassword: 'NewPassword123!' };
      
      mockJwtService.verifyToken.mockReturnValueOnce({ sub: '123', email: validEmail });

      const expectedError = new Error('Database Error');
      mockUpdateUseCase.execute.mockRejectedValueOnce(expectedError);

      await expect(controller.updatePassword(req, dto)).rejects.toThrow(expectedError);
    });
  });
});