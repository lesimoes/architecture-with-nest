import { BankAccount } from 'src/bank-account/domain/back-account';

export abstract class MakeWithdrawRepository {
  abstract update(bankAccount: BankAccount): Promise<BankAccount>;
}
