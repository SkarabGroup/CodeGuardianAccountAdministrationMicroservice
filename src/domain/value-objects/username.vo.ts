import {z} from 'zod'
const nameSchema = z.string().min(4).max(20).regex(/^[a-zA-Z0-9]+$/)
export class Username{
    private readonly value: string;

    private constructor(username:string){
        this.isValidName(username);
        this.value = username;
    }

    private isValidName(username: string){
        const result = nameSchema.safeParse(username);
        if(!result.success){
            throw new Error("username is not valid!");
        }
    }

    public static create(value:string): Username{
        if(!value){
            throw new Error("Unable to create username!");
        }
        return new Username(value);
    }
        
    public equals(other:Username):boolean{
        return this.value === other.value;
    }

    public getValue():string{
        return this.value;
    }
}