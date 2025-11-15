import { Module } from '@nestjs/common';
import { BankAccountController } from '../presenters/http/bank-account.controller';
import { BankAccountFactory } from '../domain/factories/bank-account.factory';
import { BankAccountService } from './bank-account.service';
import { CreateBankAccountCommandHandler } from './commands/create-bank-account-command-handler';
import { MakeDepositCommandHandler } from './commands/make-deposit.command-handler';
import { MakeWithdrawCommandHandler } from './commands/make-withdraw.command-handler';
import { BankAccountInfrastructureModule } from '../infrastructure/bank-account-infrastructure.module';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [BankAccountInfrastructureModule, SharedModule],
  controllers: [BankAccountController],
  exports: [SharedModule],
  providers: [
    BankAccountFactory,
    BankAccountService,
    CreateBankAccountCommandHandler,
    MakeDepositCommandHandler,
    MakeWithdrawCommandHandler,
  ],
})
export class BankAccountModule {}
