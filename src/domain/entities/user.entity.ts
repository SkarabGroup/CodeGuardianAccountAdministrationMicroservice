import { Email } from '../value-objects/email.vo'
import { Password } from '../value-objects/password.vo'
import { UserId } from '../value-objects/user-id.vo'
import { Username } from '../value-objects/username.vo'

export class User{
    constructor(
        private readonly id: UserId,
        private readonly name: Username,
        private readonly email: Email,
        private readonly password: Password,
        private readonly createdAt: Date
    ){}

    static create(id:string, name: string, email: string, password: string){
        return new User(
            UserId.create(id),
            Username.create(name),
            Email.create(email),
            Password.create(password),
            new Date()
        )
    }

    getId(): UserId{
        return this.id;
    }
    getName(): Username{
        return this.name;
    }
    getEmail(): Email{
        return this.email;
    }
    getPassword(): Password{
        return this.password;
    }
    getCreatedAt(): Date{
        return this.createdAt;
    }
    
}