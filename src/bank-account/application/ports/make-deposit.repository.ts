import { BankAccount } from 'src/bank-account/domain/back-account';

export abstract class MakeDepositRepository {
  abstract update(bankAccount: BankAccount): Promise<BankAccount>;
}
