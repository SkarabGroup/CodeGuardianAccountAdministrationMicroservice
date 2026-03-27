import {Email} from '../../../src/domain/value-objects/email.vo'

describe('Email', () => {
  describe('create()', () => {
    it('crea email valida', () => {
      const email = Email.create('Test@Example.COM');
      expect(email).toBeInstanceOf(Email);
    });
 
    it('dovrebbe fare throw quando la stringa è vuota', () => {
      expect(() => Email.create('')).toThrow('Unable to create an Email!');
    });
 
    it('dovrebbe dare formato non valido', () => {
      expect(() => Email.create('not-an-email')).toThrow('Email is not valid!');
    });
 
    it('manca il dominio', () => {
      expect(() => Email.create('user@')).toThrow('Email is not valid!');
    });
  });
 
  describe('getValue()', () => {
    it('torna il dato come è stato salvato', () => {
      const email = Email.create('test@example.com');
      expect(email.getValue()).toBe('test@example.com');
    });
  });
 
  describe('equals()', () => {
    it('ritorna vero quando gli passi due mail uguali', () => {
      const a = Email.create('user@example.com');
      const b = Email.create('user@example.com');
      expect(a.equals(b)).toBe(true);
    });
    
    it('torna true normailzzando le maisucole',()=>{
      const a = Email.create('User@examplE.com');
      const b = Email.create('user@example.com');
      expect(a.equals(b)).toBe(true);
    });
    
    it('ritorna falso con due mail diverse', () => {
      const a = Email.create('a@example.com');
      const b = Email.create('b@example.com');
      expect(a.equals(b)).toBe(false);
    });
  });
});