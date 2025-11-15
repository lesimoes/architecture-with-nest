import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { BankAccountFactory } from 'src/bank-account/domain/factories/bank-account.factory';
import { CreateBankAccountCommand } from './create-bank-account.command';
import { CreateBankAccountRepository } from '../ports/create-bank-account.repository';

@CommandHandler(CreateBankAccountCommand)
export class CreateBankAccountCommandHandler
  implements ICommandHandler<CreateBankAccountCommand>
{
  private readonly logger = new Logger(CreateBankAccountCommandHandler.name);
  constructor(
    private readonly bankAccountFactory: BankAccountFactory,
    private readonly createBankAccountRepository: CreateBankAccountRepository,
  ) {}

  async execute(command: CreateBankAccountCommand) {
    this.logger.debug(`Creating bank account for: ${command.ownerName}`);
    const bankAccount = this.bankAccountFactory.create(
      command.ownerName,
      command.ownerDocument,
    );
    await this.createBankAccountRepository.save(bankAccount);
    this.logger.log(`Bank account created: ${bankAccount.number.number}`);

    return bankAccount;
  }
}
