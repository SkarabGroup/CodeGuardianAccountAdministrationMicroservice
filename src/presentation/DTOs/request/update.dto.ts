import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdateRequestDto {
  @IsNotEmpty({ message: 'La nuova password è obbligatoria' })
  @IsString()
  @MinLength(8, {
    message: 'La nuova password deve essere di almeno 8 caratteri',
  })
  newPassword!: string;
}
