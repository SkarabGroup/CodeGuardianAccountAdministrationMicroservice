import { validate } from 'class-validator';
import { RegistrationDto } from '../../src/presentation/DTOs/request/registration.dto';

describe('RegistrationDto Validation', () => {
  let dto: RegistrationDto;

  // Prima di ogni test, creiamo un DTO con dati validi
  beforeEach(() => {
    dto = new RegistrationDto();
    dto.email = 'utente@example.com';
    dto.password = 'SuperPassword123!'; // Soddisfa tutte le regole
  });

  it('dovrebbe passare la validazione con dati corretti', async () => {
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  describe('Email', () => {
    it("dovrebbe fallire se l'email non ha un formato valido", async () => {
      dto.email = 'email-non-valida';
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });
  });

  describe('Password', () => {
    it('dovrebbe fallire se la password è più corta di 8 caratteri', async () => {
      dto.password = 'Aa1!'; // Valida ma troppo corta (4 caratteri)
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('password');
      expect(errors[0].constraints).toHaveProperty('minLength');
    });

    it('dovrebbe fallire se manca la lettera maiuscola', async () => {
      dto.password = 'superpassword123!';
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('matches');
      expect(Object.values(errors[0].constraints!)).toContain(
        'Password must contain at least one uppercase letter',
      );
    });

    it('dovrebbe fallire se manca la lettera minuscola', async () => {
      dto.password = 'SUPERPASSWORD123!';
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('matches');
      expect(Object.values(errors[0].constraints!)).toContain(
        'Password must contain at least one lowercase letter',
      );
    });

    it('dovrebbe fallire se manca il numero', async () => {
      dto.password = 'SuperPassword!!!';
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('matches');
      expect(Object.values(errors[0].constraints!)).toContain(
        'Password must contain at least one number',
      );
    });

    it('dovrebbe fallire se manca il carattere speciale', async () => {
      dto.password = 'SuperPassword123';
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('matches');
      expect(Object.values(errors[0].constraints!)).toContain(
        'Password must contain at least one special character',
      );
    });
  });
});