import { BankAccount } from 'src/bank-account/domain/back-account';

export abstract class UpdateBankAccountRepository {
  abstract update(bankAccount: BankAccount): Promise<BankAccount>;
}
