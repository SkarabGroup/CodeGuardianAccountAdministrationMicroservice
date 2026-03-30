import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '../../src/application/services/helper/jwt.service';
import * as jwt from 'jsonwebtoken';
import { JwtPayload } from '../../src/application/DTOs/jwt-payload.type'; 

// Mockiamo l'intera libreria jsonwebtoken
jest.mock('jsonwebtoken');

describe('JwtService', () => {
  let service: JwtService;

  const defaultSecret = 'dev-secret-change-me';
  const defaultExpiresIn = '2h';
  
  const mockPayload: JwtPayload = { sub: '123', email: 'test@example.com' };
  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mocked_token';

  beforeEach(async () => {
    // Assicuriamoci che la variabile d'ambiente non interferisca
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
    it('dovrebbe generare un token in modo asincrono con i parametri corretti', async () => {
      // jwt.sign è sincrono nel tuo codice, quindi usiamo mockReturnValue
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      // Aggiungiamo 'await' perché il tuo metodo generateToken ora è async
      const result = await service.generateToken(mockPayload);

      expect(jwt.sign).toHaveBeenCalledWith(
        mockPayload,
        defaultSecret,
        { expiresIn: defaultExpiresIn }
      );
      expect(result).toBe(mockToken);
    });
  });

  describe('verifyToken', () => {
    it('dovrebbe restituire il payload decodificato se il token è valido', async () => {
      // jwt.verify è sincrono, usiamo mockReturnValue
      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

      // Aggiungiamo 'await' perché il tuo metodo verifyToken ora è async
      const result = await service.verifyToken(mockToken);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, defaultSecret);
      expect(result).toEqual(mockPayload);
    });

    it('dovrebbe restituire null se la verifica del token fallisce', async () => {
      // Simuliamo l'errore generato dalla libreria (es. token scaduto)
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('invalid token');
      });

      // Aggiungiamo 'await'
      const result = await service.verifyToken(mockToken);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, defaultSecret);
      expect(result).toBeNull();
    });
  });
});