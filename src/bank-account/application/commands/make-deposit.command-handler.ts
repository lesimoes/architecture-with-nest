import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { Logger, NotFoundException } from '@nestjs/common';
import { MakeDepositCommand } from './make-deposit.command';
import { FindBankAccountRepository } from '../ports/find-bank-account.repository';
import { MakeDepositRepository } from '../ports/make-deposit.repository';

@CommandHandler(MakeDepositCommand)
export class MakeDepositCommandHandler
  implements ICommandHandler<MakeDepositCommand>
{
  private readonly logger = new Logger(MakeDepositCommandHandler.name);

  constructor(
    private readonly eventPublisher: EventPublisher,
    private readonly findBankAccountRepository: FindBankAccountRepository,
    private readonly makeDepositRepository: MakeDepositRepository,
  ) {}

  async execute(command: MakeDepositCommand) {
    this.logger.debug(
      `Making deposit of ${command.money.amount} to account ${command.accountNumber.number}`,
    );

    const bankAccount = await this.findBankAccountRepository.findByNumber(
      command.accountNumber,
    );

    if (!bankAccount) {
      throw new NotFoundException(
        `Bank account with number ${command.accountNumber.number} not found`,
      );
    }

    this.eventPublisher.mergeObjectContext(bankAccount);
    bankAccount.deposit(command.money);
    bankAccount.commit();

    const updatedAccount = await this.makeDepositRepository.update(bankAccount);

    this.logger.log(
      `Deposit of ${command.money.amount} made to account ${command.accountNumber.number}. New balance: ${updatedAccount.balance.money.amount}`,
    );

    return updatedAccount;
  }
}
