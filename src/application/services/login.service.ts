import { IloginUseCase } from "../use-cases/login.usecase";
import { LoginCommand } from "../commands/login.command";
import { AuthResponseDto } from "../../presentation/DTOs/response/auth-response.dto";
import { Inject, Injectable } from "@nestjs/common";
import type { IUserFindPort } from "../ports/IUserFind.port";
import type { IHashPasswordPort } from "../ports/IHashPassword.port";
import type { ITokenProviderPort } from "../ports/ITokenProvider.port";
import type { IHashComparePort } from "../ports/IHashCompare.port";
@Injectable()

export class LoginService implements IloginUseCase {
    @Inject('IUserFindPort') private readonly userFindPort: IUserFindPort;
    @Inject('IHashPasswordPort') private readonly hashPasswordPort: IHashPasswordPort;
    @Inject('ITokenProviderPort') private readonly tokenProviderPort: ITokenProviderPort;
    @Inject('IHashComparePort') private readonly hashComparePort: IHashComparePort;
    constructor() {}    

    async execute(command: LoginCommand):  Promise<AuthResponseDto>{
        //1. check che lo user esista
        const user = await this.userFindPort.find(command.email);
        if (!user) {throw new Error('Invalid credentials');}

        //2. check che la password sia giusta
        const isPasswordValid = await this.hashComparePort.compare(
            command.password,
            user.getPasswordHash().value
        );
        
        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }

        //3. generazione token
        const accessToken = this.tokenProviderPort.generateToken({
            sub: user.getUserId().value, 
            email: user.getEmail().value,
        });

        // 4. return rispostas
        const response = new AuthResponseDto();
        response.accessToken = accessToken;
        response.user = user.toDTO();
        return response;
    }
}