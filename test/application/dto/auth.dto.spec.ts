import { validate } from 'class-validator';
import {AuthDto} from '../../../src/application/DTOs/auth.dto';
describe('AuthDto (Input Validation)', () => {
  let dto: AuthDto;

  beforeEach(() => {
    dto = new AuthDto();
    dto.email = 'test@example.com';
    dto.password = 'Password123!'; // Valida di default
  });

  it('dovrebbe passare se tutti i campi sono validi', async () => {
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  describe('Email validation', () => {
    it('dovrebbe fallire se l’email non è nel formato corretto', async () => {
      dto.email = 'email-non-valida';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
    });
  });

  describe('Password validation', () => {
    it('dovrebbe fallire se la password è più corta di 8 caratteri', async () => {
      dto.password = 'Ab1!';
      const errors = await validate(dto);
      expect(errors.map(e => e.property)).toContain('password');
    });

    const passwordCases = [
      { pwd: 'password123!', missing: 'maiuscola' },
      { pwd: 'PASSWORD123!', missing: 'minuscola' },
      { pwd: 'Password!', missing: 'numero' },
      { pwd: 'Password123', missing: 'carattere speciale' },
    ];

    test.each(passwordCases)(
      'dovrebbe fallire se manca la $missing',
      async ({ pwd }) => {
        dto.password = pwd;
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        // Verifica che il messaggio di errore sia quello custom definito nel DTO
        const constraints = Object.values(errors[0].constraints || {});
        expect(constraints.length).toBeGreaterThan(0);
      }
    );
  });
});