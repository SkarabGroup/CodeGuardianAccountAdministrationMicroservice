import { Test, TestingModule } from '@nestjs/testing';
import { LogoutController } from '../../../src/presentation/controllers/logout.controller';
import { ILogoutUseCase } from '../../../src/application/use-cases/logout.usecase';
import { LOGOUT_SERVICE } from '../../../src/application/services/logout.service';
import { LogoutRequestDto } from '../../../src/presentation/DTOs/request/logout.dto';
import { LogoutResponseDto } from '../../../src/presentation/DTOs/response/logout-response.dto';

describe('LogoutController', () => {
  let controller: LogoutController;
  let logoutUseCase: ILogoutUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LogoutController],
      providers: [
        {
          provide: LOGOUT_SERVICE,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<LogoutController>(LogoutController);
    logoutUseCase = module.get<ILogoutUseCase>(LOGOUT_SERVICE);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('logout', () => {
    it('should call logoutUseCase.execute and return a success message', async () => {
      const executeSpy = jest.spyOn(logoutUseCase, 'execute');
      const logoutDto: LogoutRequestDto = {
        refreshToken: 'mock-refresh-token',
      };

      const result: LogoutResponseDto = await controller.logout(logoutDto);

      expect(executeSpy).toHaveBeenCalled();
      expect(result.message).toBe('Logged out successfully');
    });
  });
});
