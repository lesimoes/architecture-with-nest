import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { MakeWithdrawCommand } from './make-withdraw.command';
import { FindBankAccountRepository } from '../ports/find-bank-account.repository';
import { MakeWithdrawRepository } from '../ports/make-withdraw.repository';

@CommandHandler(MakeWithdrawCommand)
export class MakeWithdrawCommandHandler
  implements ICommandHandler<MakeWithdrawCommand>
{
  private readonly logger = new Logger(MakeWithdrawCommandHandler.name);

  constructor(
    private readonly eventPublisher: EventPublisher,
    private readonly findBankAccountRepository: FindBankAccountRepository,
    private readonly makeWithdrawRepository: MakeWithdrawRepository,
  ) {}

  async execute(command: MakeWithdrawCommand) {
    this.logger.debug(
      `Making withdraw of ${command.money.amount} from account ${command.accountNumber.number}`,
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
    try {
      bankAccount.withdraw(command.money);
      bankAccount.commit();
    } catch (error) {
      if (error instanceof Error && error.message === 'Insufficient balance') {
        throw new BadRequestException('Insufficient balance');
      }
      throw error;
    }

    const updatedAccount =
      await this.makeWithdrawRepository.update(bankAccount);

    this.logger.log(
      `Withdraw of ${command.money.amount} made from account ${command.accountNumber.number}. New balance: ${updatedAccount.balance.money.amount}`,
    );

    return updatedAccount;
  }
}
