import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateBankAccountCommand } from './commands/create-bank-account.command';
import { MakeDepositCommand } from './commands/make-deposit.command';
import { MakeWithdrawCommand } from './commands/make-withdraw.command';

@Injectable()
export class BankAccountService {
  constructor(private readonly commandBus: CommandBus) {}

  create(createBankAccountCommand: CreateBankAccountCommand) {
    return this.commandBus.execute(createBankAccountCommand);
  }

  deposit(makeDepositCommand: MakeDepositCommand) {
    return this.commandBus.execute(makeDepositCommand);
  }

  withdraw(makeWithdrawCommand: MakeWithdrawCommand) {
    return this.commandBus.execute(makeWithdrawCommand);
  }
}
