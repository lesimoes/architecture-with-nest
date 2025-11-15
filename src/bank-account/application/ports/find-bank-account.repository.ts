import { BankAccount } from 'src/bank-account/domain/back-account';
import { AccountNumber } from 'src/bank-account/domain/value-objects/account-number';

export abstract class FindBankAccountRepository {
  abstract findByNumber(
    accountNumber: AccountNumber,
  ): Promise<BankAccount | null>;
}
