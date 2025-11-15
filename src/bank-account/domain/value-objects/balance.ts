import { Money } from './money';

export class Balance {
  constructor(public readonly money: Money) {}

  static fromAmount(amount: number, currency: string = 'BRL'): Balance {
    return new Balance(new Money(amount, currency));
  }

  add(money: Money): Balance {
    return new Balance(this.money.add(money));
  }

  subtract(money: Money): Balance {
    return new Balance(this.money.subtract(money));
  }

  equals(balance: Balance): boolean {
    return this.money.equals(balance.money);
  }
}
