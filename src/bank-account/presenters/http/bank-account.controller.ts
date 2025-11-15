import { Body, Controller, Post, Param } from '@nestjs/common';
import { CreateBankAccountDto } from '../dto/create-bank-account.dto';
import { MakeDepositDto } from '../dto/make-deposit.dto';
import { MakeWithdrawDto } from '../dto/make-withdraw.dto';
import { BankAccountService } from 'src/bank-account/application/bank-account.service';
import { CreateBankAccountCommand } from 'src/bank-account/application/commands/create-bank-account.command';
import { MakeDepositCommand } from 'src/bank-account/application/commands/make-deposit.command';
import { MakeWithdrawCommand } from 'src/bank-account/application/commands/make-withdraw.command';
import { AccountNumber } from 'src/bank-account/domain/value-objects/account-number';
import { Money } from 'src/bank-account/domain/value-objects/money';

@Controller('bank-accounts')
export class BankAccountController {
  constructor(private readonly bankAccountService: BankAccountService) {}

  @Post()
  create(@Body() createBankAccountDto: CreateBankAccountDto) {
    return this.bankAccountService.create(
      new CreateBankAccountCommand(
        createBankAccountDto.ownerName,
        createBankAccountDto.ownerDocument,
      ),
    );
  }

  @Post(':accountNumber/deposit')
  deposit(
    @Param('accountNumber') accountNumber: string,
    @Body() makeDepositDto: MakeDepositDto,
  ) {
    return this.bankAccountService.deposit(
      new MakeDepositCommand(
        new AccountNumber(accountNumber),
        new Money(makeDepositDto.amount, makeDepositDto.currency || 'BRL'),
      ),
    );
  }

  @Post(':accountNumber/withdraw')
  withdraw(
    @Param('accountNumber') accountNumber: string,
    @Body() makeWithdrawDto: MakeWithdrawDto,
  ) {
    return this.bankAccountService.withdraw(
      new MakeWithdrawCommand(
        new AccountNumber(accountNumber),
        new Money(makeWithdrawDto.amount, makeWithdrawDto.currency || 'BRL'),
      ),
    );
  }
}
