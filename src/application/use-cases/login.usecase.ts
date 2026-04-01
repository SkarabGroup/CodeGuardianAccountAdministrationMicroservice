import { AuthResponseDto } from "../../presentation/DTOs/response/responseDTO";
import { LoginCommand } from "../commands/login.command";

export interface IloginUseCase {
    execute(command: LoginCommand): Promise<AuthResponseDto>;
}