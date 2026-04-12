import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { UpdateController } from '../../../src/presentation/controllers/update.controller';
import { UPDATE_SERVICE } from '../../../src/application/services/update.service';
import type { IupdateUseCase } from '../../../src/application/use-cases/update.usecase';
import { JwtService } from '../../../src/infrastructure/adapters/jwt.service';
import { UpdateRequestDto } from '../../../src/presentation/DTOs/request/update.dto';
import { AuthResultDto } from '../../../src/application/DTOs/auth-result.dto';
import {
  AuthResponseDto,
  UserResponseDto,
} from '../../../src/presentation/DTOs/response/auth-response.dto';

describe('UpdateController', () => {
  let controller: UpdateController;

  // Variabili standalone per risolvere l'errore @typescript-eslint/unbound-method
  const mockUpdateExecute = jest.fn();
  const mockVerifyToken = jest.fn();

  // Assegniamo le funzioni mock agli oggetti tipizzati
  const mockUpdateUseCase: IupdateUseCase = {
    execute: mockUpdateExecute,
  };

  const mockJwtService = {
    verifyToken: mockVerifyToken,
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

    // Helper per creare una Request tipizzata senza usare 'any'
    const createMockRequest = (authHeader?: string): Request => {
      return {
        headers: {
          authorization: authHeader,
        },
      } as unknown as Request;
    };

    it("dovrebbe lanciare UnauthorizedException se manca l'header authorization", async () => {
      const req = createMockRequest(undefined);
      const dto: UpdateRequestDto = { newPassword: 'NewPassword123!' };

      await expect(controller.updatePassword(req, dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('dovrebbe lanciare UnauthorizedException se il token non è valido', async () => {
      const req = createMockRequest('Bearer bad.token');
      const dto: UpdateRequestDto = { newPassword: 'NewPassword123!' };

      mockVerifyToken.mockImplementationOnce(() => {
        throw new Error('Invalid signature');
      });

      await expect(controller.updatePassword(req, dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("dovrebbe lanciare UnauthorizedException se il token non contiene l'email", async () => {
      const req = createMockRequest(`Bearer ${validToken}`);
      const dto: UpdateRequestDto = { newPassword: 'NewPassword123!' };

      // Manca l'email nel payload finto
      mockVerifyToken.mockReturnValueOnce({ sub: '123' });

      await expect(controller.updatePassword(req, dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("dovrebbe mappare il DTO e il Token nel Command, chiamare il caso d'uso e mappare la risposta", async () => {
      // 1. INGRESSO
      const req = createMockRequest(`Bearer ${validToken}`);
      const requestDto: UpdateRequestDto = {
        newPassword: 'NewPassword123!',
      };

      // Simuliamo la lettura del token con successo
      mockVerifyToken.mockReturnValueOnce({
        sub: '123e4567',
        email: validEmail,
      });

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

      mockUpdateExecute.mockResolvedValueOnce(mockAuthResult);

      // 3. Chiamata effettiva al controller
      const result = await controller.updatePassword(req, requestDto);

      // 4. Verifiche: il Command deve unire Email (dal token) e Password (dal body)
      expect(mockVerifyToken).toHaveBeenCalledWith(validToken);
      expect(mockUpdateExecute).toHaveBeenCalledTimes(1);

      // Usiamo objectContaining per evitare di importare UpdateUserCommand
      expect(mockUpdateExecute).toHaveBeenCalledWith(
        expect.objectContaining({
          email: validEmail,
          newPassword: 'NewPassword123!',
        }),
      );

      // 5. Verifica dell'uscita
      expect(result).toBeInstanceOf(AuthResponseDto);
      expect(result.accessToken).toBe('fake-access-token');
      expect(result.user).toBeInstanceOf(UserResponseDto);
      expect(result.user.email).toBe(validEmail);
    });

    it('dovrebbe propagare correttamente le eccezioni del Service', async () => {
      const req = createMockRequest(`Bearer ${validToken}`);
      const dto: UpdateRequestDto = { newPassword: 'NewPassword123!' };

      mockVerifyToken.mockReturnValueOnce({ sub: '123', email: validEmail });

      const expectedError = new Error('Database Error');
      mockUpdateExecute.mockRejectedValueOnce(expectedError);

      await expect(controller.updatePassword(req, dto)).rejects.toThrow(
        expectedError,
      );
    });
  });
});
