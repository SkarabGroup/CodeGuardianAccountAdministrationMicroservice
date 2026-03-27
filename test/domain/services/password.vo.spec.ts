import { PARAMTYPES_METADATA } from '@nestjs/common/constants';
import {Password} from '../../../src/domain/value-objects/password.vo'

describe('Password', ()=>{
    describe('create()', ()=>{
        it('crea password valida', () =>{
            const password = Password.create('Password1.');
            expect(password).toBeInstanceOf(Password);
        });

        it('da errore con stringa vuota', () =>{
            expect(() => Password.create('')).toThrow('Unable to create Password!');
        });

        it('da errore se la password non contiene una maiuscola', () =>{
            expect(() => Password.create('ciccciolin4.')).toThrow('Password is not valid!');
        });

        it('da errore quando la password non contiene un numero', () =>{
            expect(() => Password.create('Cicciolina.')).toThrow('Password is not valid!');
        });

        it('da errore quando la password non contiene almeno 1 carattere speciale', () =>{
            expect(()=> Password.create('Cicciolin4aa')).toThrow('Password is not valid!');
        });

        it('da errore quando la password non è lunga almeno 8 caratteri', () =>{
            expect(() => Password.create('Cazz0.')).toThrow('Password is not valid!');
        });
    });

    describe('getValue()', () =>{
        it('torna il valore del dato grezzo', () =>{
            const password = Password.create('M4nnaggin4.');
            expect(password.getValue()).toBe('M4nnaggin4.');
        });
    });

    describe('euqals()', () =>{
        it('torna true quando i due valori sono uguali', () =>{
            const a = Password.create('M4nnaggin4.');
            const b = Password.create('M4nnaggin4.');
            expect(a.equals(b)).toBe(true);
        });
        it('torna false quando i due valori sono diversi', () =>{
            const a = Password.create('M4nnaggin4.');
            const b = Password.create('M4nnaggin4!');
            expect(a.equals(b)).toBe(false);
        });
    });
})