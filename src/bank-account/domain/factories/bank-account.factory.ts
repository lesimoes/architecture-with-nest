import { randomUUID } from 'crypto';

import { BankAccount } from '../back-account';
import { AccountId } from '../value-objects/account-id';
import { AccountNumber } from '../value-objects/account-number';
import { Balance } from '../value-objects/balance';
import { Owner } from '../value-objects/owner';
import { Money } from '../value-objects/money';

export class BankAccountFactory {
  create(ownerName: string, ownerDocument: string): BankAccount {
    const owner = new Owner(ownerName, ownerDocument);
    const bankAccount = new BankAccount();
    const accountId = new AccountId(randomUUID());
    bankAccount.id = accountId;
    bankAccount.versionedId = accountId.id;
    bankAccount.number = new AccountNumber(
      Math.random().toString(36).substring(2, 15),
    );

    bankAccount.owner = owner;
    bankAccount.balance = new Balance(new Money(0, 'BRL'));

    return bankAccount;
  }
}
