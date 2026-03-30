export interface IRemovePatUseCase {
  removePat(userId: string): Promise<void>;
}
