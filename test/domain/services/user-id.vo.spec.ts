import {UserId} from '../../../src/domain/value-objects/user-id.vo'

describe('UserId', () =>{
  describe('create()', () =>{
      it('crea user uuid valido passando stringa vuota', () =>{
          const userId = UserId.create('');
          expect(userId).toBeInstanceOf(UserId);
      });
      it('crea user uuid valido', () =>{
        const userId = UserId.create('123e4567-e89b-12d3-a456-426614174000');
        expect(userId).toBeInstanceOf(UserId);
      });
      it('dovrebbe dare formato non valido', () =>{
        expect(() => UserId.create('123e4567-e89b-12d3-a456-426614174000329r8--ca--')).toThrow('UUID is not valid!');
      });
  });
  describe('getValue', () =>{
    it('torna il dato come è stato salvato', () => {
      const userId = UserId.create('123e4567-e89b-12d3-a456-426614174000');
      expect(userId.getValue()).toBe('123e4567-e89b-12d3-a456-426614174000');
    });
  });
  describe('equals()', () =>{
    it('torna vero quando gli passo due UUID uguali', () =>{
      const a = UserId.create('123e4567-e89b-12d3-a456-426614174000');
      const b = UserId.create('123e4567-e89b-12d3-a456-426614174000');
      expect(a.equals(b)).toBe(true);
    });
    it('torna falso quando gli passo due UUID uguali', () =>{
      const a = UserId.create('123e4567-e89b-12d3-a456-426614174000');
      const b = UserId.create('123e4568-e89b-12d3-a456-426614174000');
      expect(a.equals(b)).toBe(false);
    });
  });

})