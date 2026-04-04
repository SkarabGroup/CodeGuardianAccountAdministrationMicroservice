import { Test, TestingModule } from '@nestjs/testing';
import { validate } from 'class-validator';
import { DeleteUserController } from '../../src/presentation/controllers/delete.controller';
import { IDeleteUseCase } from '../../src/application/use-cases/delete.usecase';
import { DeleteDto } from '../../src/presentation/DTOs/request/delete.dto';
import { DeleteCommand } from '../../src/application/commands/delete.command';
import { DeleteResponseDto } from '../../src/presentation/DTOs/response/delete-response.dto';

describe('DeleteUserController', () => {
  let controller: DeleteUserController;
  let deleteUseCase: IDeleteUseCase;

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
      ],
    }).compile();

    controller = module.get<DeleteUserController>(DeleteUserController);
    deleteUseCase = module.get<IDeleteUseCase>('IDeleteUseCase');
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('delete', () => {
    const VALID_UUID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

    it('should build a DeleteCommand from the DTO and call the use case', async () => {
      const dto = new DeleteDto();
      dto.userToDelete = VALID_UUID;

      const expectedResponse = new DeleteResponseDto();
      expectedResponse.deleted = true;

      const executeSpy = jest
        .spyOn(deleteUseCase, 'execute')
        .mockResolvedValue(expectedResponse);

      const result = await controller.delete(dto);

      const expectedCommand = new DeleteCommand();
      expectedCommand.userToDelete = VALID_UUID;

      expect(executeSpy).toHaveBeenCalledTimes(1);
      expect(executeSpy).toHaveBeenCalledWith(expectedCommand);
      expect(result).toBe(expectedResponse);
    });

    it('should return the DeleteResponseDto with deleted property', async () => {
      const dto = new DeleteDto();
      dto.userToDelete = VALID_UUID;

      const expectedResponse = new DeleteResponseDto();
      expectedResponse.deleted = true;

      jest.spyOn(deleteUseCase, 'execute').mockResolvedValue(expectedResponse);

      const result = await controller.delete(dto);

      expect(result).toBeInstanceOf(DeleteResponseDto);
      expect(result.deleted).toBe(true);
    });

    it('should propagate exceptions thrown by the use case', async () => {
      const dto = new DeleteDto();
      dto.userToDelete = VALID_UUID;

      const error = new Error('Use case failure');
      jest.spyOn(deleteUseCase, 'execute').mockRejectedValue(error);

      await expect(controller.delete(dto)).rejects.toThrow(error);
    });
  });
});

describe('DeleteDto Validation', () => {
  let dto: DeleteDto;

  beforeEach(() => {
    dto = new DeleteDto();
    dto.userToDelete = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  });

  it('should pass validation with a valid UUID', async () => {
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation when userToDelete is not a UUID', async () => {
    dto.userToDelete = 'not-a-uuid';
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('userToDelete');
    expect(errors[0].constraints).toHaveProperty('isUuid');
  });

  it('should fail validation when userToDelete is an empty string', async () => {
    dto.userToDelete = '';
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('userToDelete');
  });
});