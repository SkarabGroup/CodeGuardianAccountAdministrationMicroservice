export class RegistrationUserCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
  ) {}
}