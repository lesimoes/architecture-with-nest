import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankAccountEntity } from './entities/bank-account.entity';
import { OrmCreateBankAccountRepository } from './repositories/create-bank-account.repository';
import { CreateBankAccountRepository } from '../application/ports/create-bank-account.repository';

@Module({
  imports: [TypeOrmModule.forFeature([BankAccountEntity])],
  providers: [
    {
      provide: CreateBankAccountRepository,
      useClass: OrmCreateBankAccountRepository,
    },
  ],
  exports: [CreateBankAccountRepository],
})
export class BankAccountInfrastructureModule {}
