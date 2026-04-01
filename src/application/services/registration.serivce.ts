/*import { IregistrationUseCase } from "../use-cases/registration.usecase";
import { RegistrationUserCommand } from "../commands/registration.command";
import { AuthResponseDto } from "../../presentation/DTOs/response/responseDTO";
import { Inject, Injectable } from "@nestjs/common";
import type { IUserFindPort } from "../ports/IUserFind.port";
import type { IUserSavePort } from "../ports/IUserSave.port";
import type { IHashPasswordPort } from "../ports/IHashPassword.port";
import type { ITokenProviderPort } from "../ports/ITokenProvider.port";
import { User } from "../../domain/entities/user.entity";
import { AuthDto } from "../../presentation/DTOs/request/auth.dto";
import { UserId } from "../../domain/value-objects/user-id.vo";
import { Email } from "../../domain/value-objects/email.vo";
import { PasswordHash } from "../../domain/value-objects/password-hash.vo";
import { v7 as uuidv7 } from 'uuid';

@Injectable()
export class RegistrationService implements IregistrationUseCase {
    @Inject('IUserFindPort') private readonly userFindPort: IUserFindPort;
    @Inject('IUserSavePort') private readonly userSavePort: IUserSavePort;
    @Inject('IHashPasswordPort') private readonly hashPasswordPort: IHashPasswordPort;
    @Inject('ITokenProviderPort') private readonly tokenProviderPort: ITokenProviderPort;

    constructor() {}

    async execute(command: RegistrationUserCommand): Promise<AuthResponseDto> {
        // 1. check su esistenza utente
        // const existingUser = await this.userFindPort.findByEmail(command.email);
        // if (existingUser) throw new ConflictException('Email already in use');
        
        // 2. hash password
        const hashedPassword = await this.hashPasswordPort.hash(command.password);

        // 3. Creazione vo
        const generatedId = uuidv7(); 
        
        const userIdVO = UserId.create(generatedId);
        const emailVO = Email.create(command.email);
        const passwordHashVO = PasswordHash.create(hashedPassword);
        //user.create(crea da solo le date, non serve passare nulla)
        const user = User.create(
            userIdVO,
            emailVO,
            passwordHashVO
        );

        // 4. salvataggio utente
        // await this.userSavePort.save(user);

        // 5. generazione token
        // Controlla come hai chiamato i getter sui VO. Se hai usato le properties classiche
        // come nei test, usa `.value`, se hai usato metodi usa `.getValue()`
        const accessToken = this.tokenProviderPort.generateToken({
            sub: user.getUserId().value, 
            email: user.getEmail().value,
        });

        // 6. ritorno response
        const response = new AuthResponseDto();
        response.accessToken = accessToken;
        // response.user = user.toDTO(); // Aggiungi questo se il tuo DTO lo richiede
        
        return response;
    }
}*/