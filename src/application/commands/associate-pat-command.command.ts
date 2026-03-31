export class AssociatePatCommand {
  constructor(
    public readonly userId: string,
    public readonly pat: string,
  ) {}
}
