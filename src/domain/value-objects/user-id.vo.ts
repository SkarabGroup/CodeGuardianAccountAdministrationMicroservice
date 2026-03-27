import { randomUUID } from 'crypto';
import {z} from 'zod';
const uuidSchema = z.string().uuid();
export class UserId{
    private readonly value;
    
    private constructor(id:string){
        this.IsValidId(id);
        this.value = id;
    }

    private IsValidId(value:string){
        const res = uuidSchema.safeParse(value)
        if(!res.success){
            throw new Error("UUID is not valid!");
        }
        return res.data;
    }

    public equals(other:UserId): boolean{
        return this.value === other.value;
    }

    public static create(value?:string):UserId{
        if(!value){
            return new UserId(randomUUID());
        }
        return new UserId(value);
    }

    public getValue():string{
        return this.value;
    }
}