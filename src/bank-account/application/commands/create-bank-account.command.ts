export class CreateBankAccountCommand {
  constructor(
    public readonly ownerName: string,
    public readonly ownerDocument: string,
  ) {}
}
