import { AuthResponseDto } from '../../../src/application/DTOs/auth-resposnse.dto';
import { User } from '../../../src/domain/entities/user.entity';

describe('AuthResponseDto (Mapping)', () => {
  it('dovrebbe mappare correttamente i dati da una User Entity', () => {
    const fixedDate = new Date();
    const mockUser = {
      getUserId: () => ({ value: 'uuid-1234' }),
      getEmail: () => ({ value: 'mario@rossi.it' }),
      getCreatedAt: () => fixedDate,
    } as unknown as User;

    const result = AuthResponseDto.fromEntity(mockUser);

    expect(result).toBeInstanceOf(AuthResponseDto);
    expect(result.id).toBe('uuid-1234');
    expect(result.email).toBe('mario@rossi.it');
    expect(result.createdAt).toEqual(fixedDate);
  });

  it('dovrebbe gestire correttamente le date', () => {
    const mockUser = {
      getUserId: () => ({ value: '1' }),
      getEmail: () => ({ value: 'a@a.com' }),
      getCreatedAt: () => new Date('2026-01-01'),
    } as unknown as User;

    const result = AuthResponseDto.fromEntity(mockUser);
    expect(result.createdAt.getFullYear()).toBe(2026);
  });
});