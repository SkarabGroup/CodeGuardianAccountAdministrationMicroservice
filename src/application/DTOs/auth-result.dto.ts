import { UserDTO } from "./user.dto";

export interface AuthResultDto {
    tokens: {
        accessToken: string;
        refreshToken: string;
    };
    user: UserDTO;  
}
