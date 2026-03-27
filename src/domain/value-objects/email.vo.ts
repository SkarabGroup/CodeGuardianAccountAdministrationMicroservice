import {z} from 'zod'

const emailSchema = z.string().email().toLowerCase().trim();

export class Email{
    private readonly value: string;

    private constructor(email:string){
        this.value = this.isValidEmail(email);
    }

    private isValidEmail(value:string): string{
        const res = emailSchema.safeParse(value);
        if(!res.success){
            throw new Error("Email is not valid!");
        }
        return res.data;
    }    
    
    public equals(other:Email):boolean{
        return this.value === other.value;
    }

    public static create(value:string): Email{
        if(!value){
            throw new Error("Unable to create an Email!");
        }
        return new Email(value);
    }

    public getValue(): string{
        return this.value;
    }
}