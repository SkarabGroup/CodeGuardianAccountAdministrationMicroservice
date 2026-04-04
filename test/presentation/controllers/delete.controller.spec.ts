import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { DeleteUserController } from '../../../src/presentation/controllers/delete.controller';
import { IDeleteUseCase } from '../../../src/application/use-cases/delete.usecase';
import { DeleteCommand } from '../../../src/application/commands/delete.command';
import { DeleteResponseDto } from '../../../src/presentation/DTOs/response/delete-response.dto';
import { JwtService } from '../../../src/infrastructure/adapters/jwt.service';
import type { Request } from 'express';

describe('DeleteUserController', () => {
  let controller: DeleteUserController;
  let deleteUseCase: IDeleteUseCase;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeleteUserController],
      providers: [
        {
          provide: 'IDeleteUseCase',
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            verifyToken: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DeleteUserController>(DeleteUserController);
    deleteUseCase = module.get<IDeleteUseCase>('IDeleteUseCase');
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('delete', () => {
    const VALID_UUID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const MOCK_TOKEN = 'mock.jwt.token';
    const VALID_REQ: Partial<Request> = {
      headers: {
        authorization: `Bearer ${MOCK_TOKEN}`,
      },
    };

    it('should build a DeleteCommand from the JWT sub and call the use case', async () => {
      const payload = { sub: VALID_UUID, email: 'test@example.com' };
      const verifyTokenSpy = jest
        .spyOn(jwtService, 'verifyToken')
        .mockReturnValue(payload);

      const expectedResponse = new DeleteResponseDto();
      expectedResponse.deleted = true;

      const executeSpy = jest
        .spyOn(deleteUseCase, 'execute')
        .mockResolvedValue(expectedResponse);

      const result = await controller.delete(VALID_REQ as Request);

      const expectedCommand = new DeleteCommand();
      expectedCommand.userToDelete = VALID_UUID;

      expect(verifyTokenSpy).toHaveBeenCalledWith(MOCK_TOKEN);
      expect(executeSpy).toHaveBeenCalledTimes(1);
      expect(executeSpy).toHaveBeenCalledWith(expectedCommand);
      expect(result).toBe(expectedResponse);
    });

    it('should throw UnauthorizedException if authorization header is missing', async () => {
      const emptyReq: Partial<Request> = { headers: {} };
      await expect(controller.delete(emptyReq as Request)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if auth header does not start with Bearer', async () => {
      const badReq: Partial<Request> = {
        headers: { authorization: 'Basic 123' },
      };
      await expect(controller.delete(badReq as Request)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if token verification fails', async () => {
      jest.spyOn(jwtService, 'verifyToken').mockReturnValue(null);
      await expect(controller.delete(VALID_REQ as Request)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if verifyToken throws', async () => {
      jest.spyOn(jwtService, 'verifyToken').mockImplementation(() => {
        throw new Error('jwt malformed');
      });

      await expect(controller.delete(VALID_REQ as Request)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return the DeleteResponseDto with deleted property', async () => {
      const payload = { sub: VALID_UUID, email: 'test@example.com' };
      jest.spyOn(jwtService, 'verifyToken').mockReturnValue(payload);

      const expectedResponse = new DeleteResponseDto();
      expectedResponse.deleted = true;

      jest.spyOn(deleteUseCase, 'execute').mockResolvedValue(expectedResponse);

      const result = await controller.delete(VALID_REQ as Request);

      expect(result).toBeInstanceOf(DeleteResponseDto);
      expect(result.deleted).toBe(true);
    });

    it('should propagate exceptions thrown by the use case', async () => {
      const payload = { sub: VALID_UUID, email: 'test@example.com' };
      jest.spyOn(jwtService, 'verifyToken').mockReturnValue(payload);

      const error = new Error('Use case failure');
      jest.spyOn(deleteUseCase, 'execute').mockRejectedValue(error);

      await expect(controller.delete(VALID_REQ as Request)).rejects.toThrow(
        'Use case failure',
      );
    });
  });
});
