import { Money } from '../value-objects/money';

export class DepositMadeEvent {
  constructor(
    public readonly accountId: string,
    public readonly amount: Money,
    public readonly balance: number,
  ) {}
}
