import { IregistrationUseCase } from "../use-cases/registration.usecase";
import { RegistrationUserCommand } from "../commands/registration.command";
import { Inject, Injectable } from "@nestjs/common";
import type { IUserFindPort } from "../ports/IUserFind.port";
import type { IUserSavePort } from "../ports/IUserSave.port";
import type { IHashPasswordPort } from "../ports/IHashPassword.port";
import type { ITokenProviderPort } from "../ports/ITokenProvider.port";
import { User } from "../../domain/entities/user.entity";
import { UserId } from "../../domain/value-objects/user-id.vo";
import { Email } from "../../domain/value-objects/email.vo";
import { PasswordHash } from "../../domain/value-objects/password-hash.vo";
import { v7 as uuidv7 } from 'uuid';
import { JwtPayload } from '../DTOs/jwt-payload.type';
import { AuthResultDto } from "../DTOs/auth-result.dto";

@Injectable()
export class RegistrationService implements IregistrationUseCase {

    constructor(
        @Inject('IUserFindPort') private readonly userFindPort: IUserFindPort,
        @Inject('IUserSavePort') private readonly userSavePort: IUserSavePort,
        @Inject('IHashPasswordPort') private readonly hashPasswordPort: IHashPasswordPort,
        @Inject('ITokenProviderPort') private readonly tokenProviderPort: ITokenProviderPort,
    ) {}

    async execute(command: RegistrationUserCommand): Promise<AuthResultDto> {
        // 1. check su esistenza utente
        const existingUser = await this.userFindPort.find(command.email);
        if (existingUser) throw new Error('Email already in use');
        
        // 2. hash password
        const hashedPassword = await this.hashPasswordPort.hash(command.password);

        // 3. Creazione vo
        const generatedId = uuidv7(); 
        
        const userIdVO = UserId.create(generatedId);
        const emailVO = Email.create(command.email);
        const passwordHashVO = PasswordHash.create(hashedPassword);
        const user = User.create(
            userIdVO,
            emailVO,
            passwordHashVO
        );

        // 4. salvataggio utente
        await this.userSavePort.save(user);

        // 5. generazione token
        const jwtPayload: JwtPayload = {
            sub: user.getUserId().value,
            email: user.getEmail().value
        };
        const accessToken = this.tokenProviderPort.generateToken(jwtPayload);
        const refreshToken = this.tokenProviderPort.generateRefreshToken(jwtPayload);

        // 6. ritorno response
        return {
            tokens: {
                accessToken: accessToken,
                refreshToken: refreshToken
            },
            user: {
                id: userIdVO.value,
                email: command.email,
                createdAt: new Date().toString(),
                updatedAt: new Date().toString(),
            }
        };
    }
}

export const REGISTRATION_SERVICE = Symbol('RegistrationService');