import { Test, TestingModule } from '@nestjs/testing';
// Correggi i percorsi se necessario
import { JwtService } from '../../src/infrastructure/adapters/jwt.service'; 
import * as jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

describe('JwtService', () => {
  let service: JwtService;

  // Modifica queste costanti se nel tuo file hanno valori diversi
  const defaultSecret = 'dev-secret-change-me';
  const defaultExpiresIn = '2h'; 
  const refreshExpiresIn = '7d';
  
  const mockPayload = { sub: 'user-123', email: 'test@example.com' };
  const mockToken = 'mocked.jwt.token.string';

  beforeEach(async () => {
    delete process.env.JWT_SECRET;

    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtService],
    }).compile();

    service = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateToken', () => {
    it('dovrebbe chiamare jwt.sign e restituire il token generato', async () => {
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);
      const result = await service.generateToken(mockPayload);
      expect(jwt.sign).toHaveBeenCalledWith(
        mockPayload,
        defaultSecret,
        { expiresIn: defaultExpiresIn }
      );
      expect(result).toBe(mockToken);
    });
  });

  describe('generateRefreshToken', () => {
    it('dovrebbe chiamare jwt.sign con expiresIn di 7 giorni e restituire il token generato', async () => {
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);
      const result = await service.generateRefreshToken(mockPayload);
      expect(jwt.sign).toHaveBeenCalledWith(
        mockPayload,
        defaultSecret,
        { expiresIn: refreshExpiresIn }
      );
      expect(result).toBe(mockToken);
    });
  });

  describe('verifyToken', () => {
    it('dovrebbe restituire il payload se il token è valido', async () => {
      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);
      const result = await service.verifyToken(mockToken);
      expect(jwt.verify).toHaveBeenCalledWith(mockToken, defaultSecret);
      expect(result).toEqual(mockPayload);
    });

    it('dovrebbe restituire null se la verifica fallisce (es. token manomesso o scaduto)', async () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('invalid token');
      });
      const result = await service.verifyToken(mockToken);
      expect(jwt.verify).toHaveBeenCalledWith(mockToken, defaultSecret);
      expect(result).toBeNull();
    });
  });
});