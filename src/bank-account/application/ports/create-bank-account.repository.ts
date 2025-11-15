import { BankAccount } from 'src/bank-account/domain/back-account';

export abstract class CreateBankAccountRepository {
  abstract save(bankAccount: BankAccount): Promise<BankAccount>;
}
