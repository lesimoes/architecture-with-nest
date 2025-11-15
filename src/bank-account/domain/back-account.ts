import { VersionedAggregateRoot } from 'src/shared/domain/aggregate-root';
import { AccountId } from './value-objects/account-id';
import { AccountNumber } from './value-objects/account-number';
import { Balance } from './value-objects/balance';
import { Money } from './value-objects/money';
import { Owner } from './value-objects/owner';
import { DepositMadeEvent } from './events/deposit-made.event';
import { WithdrawMadeEvent } from './events/withdraw-made.event';

export class BankAccount extends VersionedAggregateRoot {
  public id: AccountId;
  public number: AccountNumber;
  public owner: Owner;
  public balance: Balance;

  constructor() {
    super();
  }

  private validateAmount(amount: number): void {
    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }
  }

  deposit(money: Money): void {
    this.validateAmount(money.amount);
    this.balance = this.balance.add(money);
    this.versionedId = this.id.id;
    this.apply(
      new DepositMadeEvent(this.id.id, money, this.balance.money.amount),
      { skipHandler: true },
    );
  }

  withdraw(money: Money): void {
    this.validateAmount(money.amount);
    if (this.balance.money.amount < money.amount) {
      throw new Error('Insufficient balance');
    }
    this.balance = this.balance.subtract(money);
    this.versionedId = this.id.id;
    this.apply(
      new WithdrawMadeEvent(this.id.id, money, this.balance.money.amount),
      { skipHandler: true },
    );
  }
}
