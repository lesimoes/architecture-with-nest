import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankAccountEntity } from './entities/bank-account.entity';
import { OrmCreateBankAccountRepository } from './repositories/create-bank-account.repository';
import { OrmFindBankAccountRepository } from './repositories/find-bank-account.repository';
import { CreateBankAccountRepository } from '../application/ports/create-bank-account.repository';
import { FindBankAccountRepository } from '../application/ports/find-bank-account.repository';
import { UpdateBankAccountRepository } from '../application/ports/update-bank-account.repository';
import { MakeDepositRepository } from '../application/ports/make-deposit.repository';
import { MakeWithdrawRepository } from '../application/ports/make-withdraw.repository';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [TypeOrmModule.forFeature([BankAccountEntity]), SharedModule],
  providers: [
    {
      provide: CreateBankAccountRepository,
      useClass: OrmCreateBankAccountRepository,
    },
    {
      provide: FindBankAccountRepository,
      useClass: OrmFindBankAccountRepository,
    },
    {
      provide: UpdateBankAccountRepository,
      useClass: OrmCreateBankAccountRepository,
    },
    {
      provide: MakeDepositRepository,
      useClass: OrmCreateBankAccountRepository,
    },
    {
      provide: MakeWithdrawRepository,
      useClass: OrmCreateBankAccountRepository,
    },
  ],
  exports: [
    CreateBankAccountRepository,
    FindBankAccountRepository,
    UpdateBankAccountRepository,
    MakeDepositRepository,
    MakeWithdrawRepository,
  ],
})
export class BankAccountInfrastructureModule {}
