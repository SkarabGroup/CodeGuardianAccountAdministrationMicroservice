export interface IAssociatePatUseCase {
  associatePat(userId: string, pat: string): Promise<void>;
}
