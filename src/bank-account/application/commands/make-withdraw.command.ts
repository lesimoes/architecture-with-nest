import { AccountNumber } from 'src/bank-account/domain/value-objects/account-number';
import { Money } from 'src/bank-account/domain/value-objects/money';

export class MakeWithdrawCommand {
  constructor(
    public readonly accountNumber: AccountNumber,
    public readonly money: Money,
  ) {}
}
