import { Body, Controller, Post } from '@nestjs/common';
import { CreateBankAccountDto } from '../dto/create-bank-account.dto';
import { BankAccountService } from 'src/bank-account/application/bank-account.service';
import { CreateBankAccountCommand } from 'src/bank-account/application/commands/create-bank-account.command';

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
}
