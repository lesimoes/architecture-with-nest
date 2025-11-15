export class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: string = 'BRL',
  ) {
    if (amount < 0) {
      throw new Error('Amount cannot be negative');
    }
    if (!currency || currency.trim().length === 0) {
      throw new Error('Currency cannot be empty');
    }
  }

  add(money: Money): Money {
    if (this.currency !== money.currency) {
      throw new Error('Cannot add money with different currencies');
    }
    return new Money(this.amount + money.amount, this.currency);
  }

  subtract(money: Money): Money {
    if (this.currency !== money.currency) {
      throw new Error('Cannot subtract money with different currencies');
    }
    if (this.amount < money.amount) {
      throw new Error('Insufficient funds');
    }
    return new Money(this.amount - money.amount, this.currency);
  }

  equals(money: Money): boolean {
    return this.amount === money.amount && this.currency === money.currency;
  }
}
