import { BankAccount } from 'src/bank-account/domain/back-account';
import { BankAccountEntity } from '../entities/bank-account.entity';
import { AccountId } from 'src/bank-account/domain/value-objects/account-id';
import { AccountNumber } from 'src/bank-account/domain/value-objects/account-number';
import { Owner } from 'src/bank-account/domain/value-objects/owner';

export class BankAccountMapper {
  static toDomain(entity: BankAccountEntity): BankAccount {
    const bankAccountModel = new BankAccount();
    bankAccountModel.id = new AccountId(entity.id);
    bankAccountModel.number = new AccountNumber(entity.number);
    const owner = new Owner(entity.owner, entity.owner);
    bankAccountModel.owner = owner;

    return bankAccountModel;
  }

  static toPersistence(bankAccount: BankAccount): BankAccountEntity {
    const bankAccountEntity = new BankAccountEntity();
    bankAccountEntity.id = bankAccount.id.id;
    bankAccountEntity.number = bankAccount.number.number;
    bankAccountEntity.owner = bankAccount.owner.name;
    bankAccountEntity.balance = bankAccount.balance.money.amount;

    return bankAccountEntity;
  }
}
