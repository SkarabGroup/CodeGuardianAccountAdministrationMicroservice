import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { DeleteUserController } from '../../src/presentation/controllers/delete.controller';
import { DELETE_SERVICE } from '../../src/application/services/delete.service';
import type { IDeleteUseCase } from '../../src/application/use-cases/delete.usecase';
import { JwtService } from '../../src/infrastructure/adapters/jwt.service';
import { DeleteResponseDto } from '../../src/presentation/DTOs/response/delete-response.dto';

describe('DeleteUserController', () => {
  let controller: DeleteUserController;

  // Variabili standalone per risolvere l'errore @typescript-eslint/unbound-method
  const mockDeleteExecute = jest.fn();
  const mockVerifyToken = jest.fn();

  // Assegniamo le funzioni mock agli oggetti tipizzati
  const mockDeleteUseCase: IDeleteUseCase = {
    execute: mockDeleteExecute,
  };

  const mockJwtService = {
    verifyToken: mockVerifyToken,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeleteUserController],
      providers: [
        {
          provide: DELETE_SERVICE,
          useValue: mockDeleteUseCase,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    controller = module.get<DeleteUserController>(DeleteUserController);
  });

  it('dovrebbe essere definito', () => {
    expect(controller).toBeDefined();
  });

  describe('delete()', () => {
    const validUserId = '123e4567-e89b-72d3-a456-426614174000';
    const validToken = 'valid.jwt.token';

    // Helper per creare una Request tipizzata senza usare 'any'
    const createMockRequest = (authHeader?: string): Request => {
      return {
        headers: {
          authorization: authHeader,
        },
      } as unknown as Request;
    };

    it("dovrebbe lanciare UnauthorizedException se l'header authorization è assente", async () => {
      const req = createMockRequest(undefined);
      await expect(controller.delete(req)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("dovrebbe lanciare UnauthorizedException se l'header non inizia con Bearer", async () => {
      const req = createMockRequest(`Basic ${validToken}`);
      await expect(controller.delete(req)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('dovrebbe lanciare UnauthorizedException se il token non è valido (verifyToken lancia un errore)', async () => {
      const req = createMockRequest(`Bearer invalid.token`);

      mockVerifyToken.mockImplementationOnce(() => {
        throw new Error('Invalid signature');
      });

      await expect(controller.delete(req)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('dovrebbe lanciare UnauthorizedException se il token non ha un payload valido (undefined)', async () => {
      const req = createMockRequest(`Bearer ${validToken}`);

      mockVerifyToken.mockReturnValueOnce(null);

      await expect(controller.delete(req)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("dovrebbe costruire un DeleteCommand dal payload JWT e chiamare il caso d'uso", async () => {
      const req = createMockRequest(`Bearer ${validToken}`);

      // Simuliamo la decodifica del token con successo
      mockVerifyToken.mockReturnValueOnce({
        sub: validUserId,
        email: 'test@test.com',
      });

      const mockResponse = new DeleteResponseDto();
      mockResponse.deleted = true;
      mockDeleteExecute.mockResolvedValueOnce(mockResponse);

      const result = await controller.delete(req);

      // Passiamo le funzioni standalone ad expect per far felice il linter
      expect(mockVerifyToken).toHaveBeenCalledWith(validToken);

      expect(mockDeleteExecute).toHaveBeenCalledTimes(1);

      // Usiamo objectContaining per verificare il command senza dover importare la classe DeleteCommand
      expect(mockDeleteExecute).toHaveBeenCalledWith(
        expect.objectContaining({ userToDelete: validUserId }),
      );

      // Verifichiamo il risultato
      expect(result).toBeInstanceOf(DeleteResponseDto);
      expect(result.deleted).toBe(true);
    });

    it("dovrebbe propagare le eccezioni lanciate dal caso d'uso", async () => {
      const req = createMockRequest(`Bearer ${validToken}`);

      mockVerifyToken.mockReturnValueOnce({
        sub: validUserId,
        email: 'test@test.com',
      });

      const expectedError = new Error('Database connection failed');
      mockDeleteExecute.mockRejectedValueOnce(expectedError);

      await expect(controller.delete(req)).rejects.toThrow(expectedError);
    });
  });
});
