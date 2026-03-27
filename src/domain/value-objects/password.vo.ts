import {z} from 'zod'
const passwordSchema = z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/).regex(/[^A-Za-z0-9]/);

export class Password{
    private readonly value: string;

    private constructor(password:string){
        this.isValidPwd(password);
        this.value = password;
    }

    private isValidPwd(password: string): string{
        const result = passwordSchema.safeParse(password);
        if(!result.success){
            throw new Error("Password is not valid!");
        }
        return result.data;
    }

    public static create(value:string): Password{
        if(!value){
            throw new Error("Unable to create Password!");
        }
        return new Password(value);
    }
        
    public equals(other:Password):boolean{
        return this.value === other.value;
    }

    public getValue():string{
        return this.value;
    }
}