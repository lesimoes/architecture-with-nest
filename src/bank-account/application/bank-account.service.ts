import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateBankAccountCommand } from './commands/create-bank-account.command';

@Injectable()
export class BankAccountService {
  constructor(private readonly commandBus: CommandBus) {}

  create(createBankAccountCommand: CreateBankAccountCommand) {
    return this.commandBus.execute(createBankAccountCommand);
  }
}
