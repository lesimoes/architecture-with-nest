import { BankAccount } from 'src/bank-account/domain/back-account';
import { BankAccountEntity } from '../entities/bank-account.entity';
import { AccountId } from 'src/bank-account/domain/value-objects/account-id';
import { AccountNumber } from 'src/bank-account/domain/value-objects/account-number';
import { Owner } from 'src/bank-account/domain/value-objects/owner';
import { Balance } from 'src/bank-account/domain/value-objects/balance';
import { Money } from 'src/bank-account/domain/value-objects/money';

export class BankAccountMapper {
  static toDomain(entity: BankAccountEntity): BankAccount {
    const bankAccountModel = new BankAccount();
    const accountId = new AccountId(entity.id);
    bankAccountModel.id = accountId;
    bankAccountModel.versionedId = accountId.id;
    bankAccountModel.number = new AccountNumber(entity.number);
    const owner = new Owner(entity.owner, entity.owner);
    bankAccountModel.owner = owner;
    const balanceAmount =
      typeof entity.balance === 'string'
        ? parseFloat(entity.balance)
        : Number(entity.balance);
    bankAccountModel.balance = new Balance(new Money(balanceAmount, 'BRL'));

    return bankAccountModel;
  }

  static toPersistence(bankAccount: BankAccount): BankAccountEntity {
    const bankAccountEntity = new BankAccountEntity();
    bankAccountEntity.id = bankAccount.id.id;
    bankAccountEntity.number = bankAccount.number.number;
    bankAccountEntity.owner = bankAccount.owner.name;
    bankAccountEntity.balance = Number(bankAccount.balance.money.amount);

    return bankAccountEntity;
  }
}
