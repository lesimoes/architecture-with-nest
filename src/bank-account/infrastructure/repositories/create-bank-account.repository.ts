import { Repository } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BankAccountEntity } from '../entities/bank-account.entity';
import { BankAccount } from 'src/bank-account/domain/back-account';
import { BankAccountMapper } from '../mapper/bank-account.mapper';
import { CreateBankAccountRepository as CreateBankAccountRepositoryPort } from '../../application/ports/create-bank-account.repository';

@Injectable()
export class OrmCreateBankAccountRepository
  implements CreateBankAccountRepositoryPort
{
  private readonly logger = new Logger(OrmCreateBankAccountRepository.name);
  constructor(
    @InjectRepository(BankAccountEntity)
    private readonly bankAccountRepository: Repository<BankAccountEntity>,
  ) {}

  async save(bankAccount: BankAccount): Promise<BankAccount> {
    this.logger.debug(`Saving bank account: ${bankAccount.number.number}`);

    const persistenceModel = BankAccountMapper.toPersistence(bankAccount);
    const newEntity = await this.bankAccountRepository.save(persistenceModel);

    return BankAccountMapper.toDomain(newEntity);
  }
}
