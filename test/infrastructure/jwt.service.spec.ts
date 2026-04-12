import { Test, TestingModule } from '@nestjs/testing';
import { JwtService, JWT_EXPIRES_IN_TOKEN, JWT_SECRET_TOKEN } from '../../src/infrastructure/adapters/jwt.service';
import * as jwt from 'jsonwebtoken';
import { JwtPayload } from '../../src/application/DTOs/jwt-payload.type';

jest.mock('jsonwebtoken');

describe('JwtService', () => {
  let service: JwtService;

  // Costanti per simulare i valori del servizio
  const defaultSecret =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE3MTI1ODAwMDAsImV4cCI6MTk5OTk5OTk5OX0.MRBqWo8jM-R9JqrrZI6ShIoDzknxyukQngaNAvQ7m9U';
  const defaultExpiresIn = '2h';

  const mockPayload: JwtPayload = {
    sub: 'user-123',
    email: 'test@example.com',
  };
  const mockToken = 'mocked.jwt.token.string';

  beforeEach(async () => {
    delete process.env.JWT_SECRET;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtService,
        { provide: JWT_SECRET_TOKEN, useValue: defaultSecret },
        { provide: JWT_EXPIRES_IN_TOKEN, useValue: defaultExpiresIn },
      ],
    }).compile();

    service = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateToken', () => {
    it('dovrebbe chiamare jwt.sign e restituire il token generato', () => {
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      const result = service.generateToken(mockPayload);

      expect(jwt.sign).toHaveBeenCalledWith(mockPayload, defaultSecret, {
        expiresIn: defaultExpiresIn,
      });
      expect(result).toBe(mockToken);
    });
  });

  describe('generateRefreshToken', () => {
    it('dovrebbe chiamare jwt.sign con expiresIn di 7 giorni e restituire il token generato', () => {
      const refreshExpiresIn = '7d';
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      const result = service.generateRefreshToken(mockPayload);

      expect(jwt.sign).toHaveBeenCalledWith(mockPayload, defaultSecret, {
        expiresIn: refreshExpiresIn,
      });
      expect(result).toBe(mockToken);
    });
  });

  describe('verifyToken', () => {
    it('dovrebbe restituire il payload se il token è valido', () => {
      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

      const result = service.verifyToken(mockToken);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, defaultSecret);
      expect(result).toEqual(mockPayload);
    });

    it('dovrebbe restituire null se la verifica fallisce (es. token manomesso o scaduto)', () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('invalid token');
      });

      const result = service.verifyToken(mockToken);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, defaultSecret);
      expect(result).toBeNull();
    });
  });
});
