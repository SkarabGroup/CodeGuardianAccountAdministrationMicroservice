export class InvalidCredentialsException extends Error {
  constructor() {
    super('Invalid Credentials, Email or password are incorrect');
    this.name = 'InvalidCredentialsException';
  }
}
