export class UpdateUserCommand { 
    constructor(
        public readonly email: string,
        public readonly password: string,
    ) {}
}