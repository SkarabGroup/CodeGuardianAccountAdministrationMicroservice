import { Test, TestingModule } from '@nestjs/testing';
import { DeleteService } from '../../../src/application/services/delete.service';
import { IUserDeletePort } from '../../../src/application/ports/IUserDelete.port';
import { DeleteCommand } from '../../../src/application/commands/delete.command';
import { DeleteResponseDto } from '../../../src/presentation/DTOs/response/delete-response.dto';

describe('DeleteService', () => {
  let service: DeleteService;
  let deletePort: IUserDeletePort;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteService,
        {
          provide: 'IUserDeletePort',
          useValue: {
            deleteUser: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DeleteService>(DeleteService);
    deletePort = module.get<IUserDeletePort>('IUserDeletePort');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    it('should delete a user and return a truthy DeleteResponseDto', async () => {
      const command = new DeleteCommand();
      command.userToDelete = 'user-123';

      const deleteUserSpy = jest
        .spyOn(deletePort, 'deleteUser')
        .mockResolvedValue(undefined);

      const result = await service.execute(command);

      expect(deleteUserSpy).toHaveBeenCalledWith('user-123');
      expect(result).toBeInstanceOf(DeleteResponseDto);
      expect(result.deleted).toBeTruthy();
    });

    it('should pass on exceptions thrown by deletePort', async () => {
      const command = new DeleteCommand();
      command.userToDelete = 'user-123';

      const error = new Error('Deletion failed');
      jest.spyOn(deletePort, 'deleteUser').mockRejectedValue(error);

      await expect(service.execute(command)).rejects.toThrow(error);
    });
  });
});
