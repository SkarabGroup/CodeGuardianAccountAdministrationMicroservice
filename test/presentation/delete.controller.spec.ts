import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { DeleteUserController } from '../../src/presentation/controllers/delete.controller';
import { DELETE_SERVICE } from '../../src/application/services/delete.service';
import type { IDeleteUseCase } from '../../src/application/use-cases/delete.usecase';
import { JwtService } from '../../src/infrastructure/adapters/jwt.service';
import { DeleteResponseDto } from '../../src/presentation/DTOs/response/delete-response.dto';
import type { DeleteCommand } from '../../src/application/commands/delete.command';

describe('DeleteUserController', () => {
  let controller: DeleteUserController;

  // 1. Creiamo il mock strettamente tipizzato per il Use Case
  const mockDeleteUseCase: jest.Mocked<IDeleteUseCase> = {
    execute: jest.fn(),
  };

  // 2. Creiamo il mock per il JwtService (ci serve solo il metodo verifyToken)
  const mockJwtService = {
    verifyToken: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeleteUserController],
      providers: [
        // Forniamo i mock al modulo di test!
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

    // Helper per creare una finta Request Express in modo tipizzato
    const createMockRequest = (authHeader?: string): Request => {
      return {
        headers: {
          authorization: authHeader,
        },
      } as unknown as Request;
    };

    it('dovrebbe lanciare UnauthorizedException se l\'header authorization è assente', async () => {
      const req = createMockRequest(undefined);
      await expect(controller.delete(req)).rejects.toThrow(UnauthorizedException);
    });

    it('dovrebbe lanciare UnauthorizedException se l\'header non inizia con Bearer', async () => {
      const req = createMockRequest(`Basic ${validToken}`);
      await expect(controller.delete(req)).rejects.toThrow(UnauthorizedException);
    });

    it('dovrebbe lanciare UnauthorizedException se il token non è valido (verifyToken lancia un errore)', async () => {
      const req = createMockRequest(`Bearer invalid.token`);
      mockJwtService.verifyToken.mockImplementationOnce(() => {
        throw new Error('Invalid signature');
      });

      await expect(controller.delete(req)).rejects.toThrow(UnauthorizedException);
    });

    it('dovrebbe costruire un DeleteCommand dal payload JWT e chiamare il caso d\'uso', async () => {
      const req = createMockRequest(`Bearer ${validToken}`);
      
      // Simuliamo la decodifica del token con successo
      mockJwtService.verifyToken.mockReturnValueOnce({ sub: validUserId, email: 'test@test.com' });

      const mockResponse = new DeleteResponseDto();
      mockResponse.deleted = true;
      mockDeleteUseCase.execute.mockResolvedValueOnce(mockResponse);

      const result = await controller.delete(req);

      // Verifichiamo che JwtService sia stato chiamato col token estratto
      expect(mockJwtService.verifyToken).toHaveBeenCalledWith(validToken);

      // Verifichiamo che il command sia stato costruito col sub estratto dal token
      expect(mockDeleteUseCase.execute).toHaveBeenCalledTimes(1);
      const passedCommand = mockDeleteUseCase.execute.mock.calls[0][0] as DeleteCommand;
      expect(passedCommand.userToDelete).toBe(validUserId);

      // Verifichiamo il risultato
      expect(result).toBeInstanceOf(DeleteResponseDto);
      expect(result.deleted).toBe(true);
    });

    it('dovrebbe propagare le eccezioni lanciate dal caso d\'uso', async () => {
      const req = createMockRequest(`Bearer ${validToken}`);
      mockJwtService.verifyToken.mockReturnValueOnce({ sub: validUserId, email: 'test@test.com' });

      const expectedError = new Error('Database connection failed');
      mockDeleteUseCase.execute.mockRejectedValueOnce(expectedError);

      await expect(controller.delete(req)).rejects.toThrow(expectedError);
    });
  });
});