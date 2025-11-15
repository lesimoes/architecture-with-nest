import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BankAccountModule } from './bank-account/application/bank-account.module';
import { CoreModule } from './core/core.module';

@Module({
  imports: [CqrsModule.forRoot(), CoreModule, BankAccountModule],
})
export class AppModule {}
