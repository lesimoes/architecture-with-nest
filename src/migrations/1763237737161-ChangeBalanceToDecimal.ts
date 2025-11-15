import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeBalanceToDecimal1763237737161 implements MigrationInterface {
  name = 'ChangeBalanceToDecimal1763237737161';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bank_account_entity" ALTER COLUMN "balance" TYPE numeric(15,2) USING "balance"::numeric(15,2)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bank_account_entity" ALTER COLUMN "balance" TYPE integer USING "balance"::integer`,
    );
  }
}
