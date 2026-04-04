import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { LoginRequestDto } from '../../src/presentation/DTOs/request/login.dto';

describe('LoginRequestDto', () => {
  it('dovrebbe passare la validazione con dati corretti', async () => {
    //creazione dto valido
    const payload = {
      email: 'user@example.com',
      password: 'SuperSecretPassword123!',
    };
    const dto = plainToInstance(LoginRequestDto, payload);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  describe('Validazione Email', () => {
    it("dovrebbe fallire se l'email è vuota", async () => {
      const payload = {
        email: '',
        password: 'password123',
      };
      const dto = plainToInstance(LoginRequestDto, payload);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it("dovrebbe fallire se l'email non ha un formato valido", async () => {
      const payload = {
        email: 'not-an-email',
        password: 'password123',
      };
      const dto = plainToInstance(LoginRequestDto, payload);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });
  });

  describe('Validazione Password', () => {
    it('dovrebbe fallire se la password è vuota', async () => {
      const payload = {
        email: 'user@example.com',
        password: '',
      };
      const dto = plainToInstance(LoginRequestDto, payload);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('password');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('dovrebbe fallire se la password non è una stringa', async () => {
      const payload = {
        email: 'user@example.com',
        password: 12345, // Tipo errato
      };
      const dto = plainToInstance(LoginRequestDto, payload);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('password');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('dovrebbe ignorare la complessità della password (nessun controllo su lunghezza/caratteri speciali)', async () => {
      const payload = {
        email: 'user@example.com',
        password: '123',
      };
      const dto = plainToInstance(LoginRequestDto, payload);
      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });
  });
});
