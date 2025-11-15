import { AccountId } from './value-objects/account-id';
import { AccountNumber } from './value-objects/account-number';
import { Balance } from './value-objects/balance';
import { Money } from './value-objects/money';
import { Owner } from './value-objects/owner';

export class BankAccount {
  public id: AccountId;
  public number: AccountNumber;
  public owner: Owner;
  public balance: Balance;

  private validateAmount(amount: number): void {
    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }
  }

  deposit(money: Money): void {
    this.validateAmount(money.amount);
    this.balance = this.balance.add(money);
  }

  withdraw(money: Money): void {
    this.validateAmount(money.amount);
    if (this.balance.money.amount < money.amount) {
      throw new Error('Insufficient balance');
    }
    this.balance = this.balance.subtract(money);
  }
}
