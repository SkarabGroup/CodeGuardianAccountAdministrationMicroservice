import { Test, TestingModule } from '@nestjs/testing';
import { BcryptService, BCRYPT_ROUNDS_TOKEN } from '../../src/infrastructure/adapters/bcrypt.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('BcryptService', () => {
  let service: BcryptService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BcryptService,
        { provide: BCRYPT_ROUNDS_TOKEN, useValue: 10 },
      ],
    }).compile();

    service = module.get<BcryptService>(BcryptService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('hash', () => {
    it('dovrebbe chiamare bcrypt.hash con il testo in chiaro e i round corretti (10)', async () => {
      const plainText = 'SuperSecretPassword!';
      const expectedHash = '$2b$10$dummyHashString...';
      (bcrypt.hash as jest.Mock).mockResolvedValue(expectedHash);

      const result = await service.hash(plainText);

      expect(bcrypt.hash).toHaveBeenCalledWith(plainText, 10);
      expect(result).toBe(expectedHash);
    });
  });

  describe('compare', () => {
    it('dovrebbe restituire true se bcrypt.compare conferma la corrispondenza', async () => {
      const plainText = 'SuperSecretPassword!';
      const hash = '$2b$10$dummyHashString...';

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.compare(plainText, hash);

      expect(bcrypt.compare).toHaveBeenCalledWith(plainText, hash);
      expect(result).toBe(true);
    });

    it('dovrebbe restituire false se bcrypt.compare fallisce (password errata)', async () => {
      const plainText = 'WrongPassword!';
      const hash = '$2b$10$dummyHashString...';

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.compare(plainText, hash);

      expect(bcrypt.compare).toHaveBeenCalledWith(plainText, hash);
      expect(result).toBe(false);
    });
  });
});
