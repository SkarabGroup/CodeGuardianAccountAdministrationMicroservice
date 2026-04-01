import { UserId } from '../../../src/domain/value-objects/user-id.vo';

// Costanti aggiornate per essere UUID versione 7 validi
// (Nota il '7' all'inizio del terzo blocco e la 'a' all'inizio del quarto)
const VALID_UUID_V7 = '018f4567-e89b-72d3-a456-426614174000';
const VALID_UUID_V7_2 = '018f4568-e89b-72d3-a456-426614174000';

// Un UUID versione 4 valido
const INVALID_UUID_V4 = '123e4567-e89b-42d3-a456-426614174000';

describe('UserId', () => {
  describe('create()', () => {
    it('dovrebbe creare un UserId valido partendo da un UUIDv7 corretto', () => {
      const userId = UserId.create(VALID_UUID_V7);
      expect(userId).toBeInstanceOf(UserId);
      expect(userId.value).toBe(VALID_UUID_V7);
    });

    it('dovrebbe lanciare un errore se si passa un UUIDv4 (versione errata)', () => {
      expect(() => UserId.create(INVALID_UUID_V4)).toThrow('UUID non valido!');
    });

    it('dovrebbe lanciare un errore se il valore è una stringa vuota', () => {
      expect(() => UserId.create('')).toThrow('UUID non valido!');
    });

    it('dovrebbe lanciare un errore se il formato non è un UUID', () => {
      expect(() =>
        UserId.create('018f4567-e89b-72d3-a456-426614174000329r8--ca--'),
      ).toThrow('UUID non valido!');
    });
  });

  describe('generate()', () => {
    it('dovrebbe istanziare un UserId partendo dal valore passato', () => {
      const userId = UserId.generate(VALID_UUID_V7);
      expect(userId).toBeInstanceOf(UserId);
      expect(userId.value).toBe(VALID_UUID_V7);
    });

    it('dovrebbe lanciare un errore se si passa un UUID invalido a generate', () => {
      expect(() => UserId.generate('stringa-a-caso')).toThrow(
        'UUID non valido!',
      );
    });
  });

  describe('value', () => {
    it('dovrebbe restituire il valore primitivo memorizzato', () => {
      const userId = UserId.create(VALID_UUID_V7);
      expect(userId.value).toBe(VALID_UUID_V7);
    });
  });

  describe('equals()', () => {
    it('dovrebbe restituire true confrontando due UserId con lo stesso valore', () => {
      const a = UserId.create(VALID_UUID_V7);
      const b = UserId.create(VALID_UUID_V7);
      expect(a.equals(b)).toBe(true);
    });

    it('dovrebbe restituire false confrontando due UserId con valori diversi', () => {
      const a = UserId.create(VALID_UUID_V7);
      const b = UserId.create(VALID_UUID_V7_2);
      expect(a.equals(b)).toBe(false);
    });

    it('dovrebbe restituire false se confrontato con un oggetto semplice (non istanza)', () => {
      const a = UserId.create(VALID_UUID_V7);
      const fake = { _value: VALID_UUID_V7 } as unknown as UserId;
      expect(a.equals(fake)).toBe(false);
    });
  });
});
