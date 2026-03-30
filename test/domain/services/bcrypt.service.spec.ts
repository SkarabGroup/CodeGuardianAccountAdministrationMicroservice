import { Test, TestingModule } from '@nestjs/testing';
import { BcryptService } from '../../../src/domain/services/implementations/bcrypt.service';
import * as bcrypt from 'bcrypt';

// Mockiamo l'intero modulo bcrypt
jest.mock('bcrypt');

describe('BcryptService', () => {
  let service: BcryptService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BcryptService],
    }).compile();

    service = module.get<BcryptService>(BcryptService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('hash', () => {
    it('dovrebbe chiamare bcrypt.hash con il testo in chiaro e il salt corretto', async () => {
      const password = 'mySecretPassword';
      const hashedResult = 'hashed_string';
      const saltRounds = 10;
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedResult);

      const result = await service.hash(password);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, saltRounds);
      expect(result).toBe(hashedResult);
    });
  });

  describe('compare', () => {
    it('dovrebbe restituire true se bcrypt.compare restituisce true', async () => {
      const password = 'mySecretPassword';
      const hash = 'hashed_string';

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.compare(password, hash);

      expect(bcrypt.compare).toHaveBeenCalledWith(password, hash);
      expect(result).toBe(true);
    });

    it('dovrebbe restituire false se bcrypt.compare restituisce false', async () => {
      const password = 'wrongPassword';
      const hash = 'hashed_string';

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.compare(password, hash);

      expect(result).toBe(false);
    });
  });
});