import { Username } from "../../../src/domain/value-objects/username.vo";

describe('Username', () =>{
    describe('create()', () =>{
        it('crea username valido', () =>{
            const name = Username.create('Kevinsuperg4y');
            expect(name).toBeInstanceOf(Username);
        });
        it('da errore quando la stringa è vuota', () =>{
            expect(() => Username.create('')).toThrow('Unable to create username!');
        });

        it('da errore quando lo username contiene dei caratteri speciali', () =>{
            expect(() => Username.create('!!!cenkcaa')).toThrow('username is not valid!');
        });
        it('da errore quando lo username è più corto di 4 char', () =>{
            expect(() => Username.create('asc')).toThrow('username is not valid!');
        });
        it('da errore quando lo username è più lungo di 20 char', () =>{
            expect(() => Username.create('abcdefghilmnopqrstuvwxyz')).toThrow('username is not valid!');
        });
    });
    
    describe('getValue()', () =>{
        it('torna il dato come è stato salvato', () =>{
            const name = Username.create('gianpaolino');
            expect(name.getValue()).toBe('gianpaolino');
        })
    });

    describe('equals()', () =>{
        it('ritorna vero quando i due nomi sono uguali', () =>{
            const a = Username.create('caccolo');
            const b = Username.create('caccolo');
            expect(a.equals(b)).toBe(true);
        });
        it('ritorna falso quando i due nomi sono diversi', () =>{
            const a = Username.create('cacccolo');
            const b = Username.create('caccola');
            expect(a.equals(b)).toBe(false);
        });
    });
})