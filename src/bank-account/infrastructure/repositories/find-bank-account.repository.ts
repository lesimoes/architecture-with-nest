import { Repository } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BankAccountEntity } from '../entities/bank-account.entity';
import { BankAccount } from 'src/bank-account/domain/back-account';
import { BankAccountMapper } from '../mapper/bank-account.mapper';
import { FindBankAccountRepository as FindBankAccountRepositoryPort } from '../../application/ports/find-bank-account.repository';
import { AccountNumber } from 'src/bank-account/domain/value-objects/account-number';
import { MongoEventStore } from 'src/shared/infrastructure/event-store/mongo-event-store';
import { Version } from 'src/shared/domain/value-objects/version';

@Injectable()
export class OrmFindBankAccountRepository
  implements FindBankAccountRepositoryPort
{
  private readonly logger = new Logger(OrmFindBankAccountRepository.name);
  constructor(
    @InjectRepository(BankAccountEntity)
    private readonly bankAccountRepository: Repository<BankAccountEntity>,
    private readonly eventStore: MongoEventStore,
  ) {}

  async findByNumber(
    accountNumber: AccountNumber,
  ): Promise<BankAccount | null> {
    this.logger.debug(
      `Finding bank account by number: ${accountNumber.number}`,
    );
    const entity = await this.bankAccountRepository.findOne({
      where: { number: accountNumber.number },
    });

    if (!entity) {
      return null;
    }

    const bankAccount = BankAccountMapper.toDomain(entity);
    const lastVersion = await this.eventStore.getLastVersion(
      bankAccount.versionedId,
    );
    bankAccount.setVersion(new Version(lastVersion));

    return bankAccount;
  }
}
