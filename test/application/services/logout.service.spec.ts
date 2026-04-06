import { Test, TestingModule } from '@nestjs/testing';
import { LogoutService } from '../../../src/application/services/logout.service';
import { LogoutCommand } from '../../../src/application/commands/logout.command';

describe('LogoutService', () => {
  let service: LogoutService;
  const mockSessionPort = {
    deleteSession: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogoutService,
        {
          provide: 'ISessionPort',
          useValue: mockSessionPort,
        },
      ],
    }).compile();

    service = module.get<LogoutService>(LogoutService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    it('should call deleteSession with the correct refresh token', async () => {
      const command = new LogoutCommand();
      command.refreshToken = 'mock-refresh-token';

      await service.execute(command);

      expect(mockSessionPort.deleteSession).toHaveBeenCalledWith(
        'mock-refresh-token',
      );
    });
  });
});
