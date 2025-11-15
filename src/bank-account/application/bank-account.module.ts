import { Module } from '@nestjs/common';
import { BankAccountController } from '../presenters/http/bank-account.controller';
import { BankAccountFactory } from '../domain/factories/bank-account.factory';
import { BankAccountService } from './bank-account.service';
import { CreateBankAccountCommandHandler } from './commands/create-bank-account-command-handler';
import { BankAccountInfrastructureModule } from '../infrastructure/bank-account-infrastructure.module';

@Module({
  imports: [BankAccountInfrastructureModule],
  controllers: [BankAccountController],
  providers: [
    BankAccountFactory,
    BankAccountService,
    CreateBankAccountCommandHandler,
  ],
})
export class BankAccountModule {}
