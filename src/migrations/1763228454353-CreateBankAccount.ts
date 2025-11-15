import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBankAccount1763228454353 implements MigrationInterface {
    name = 'CreateBankAccount1763228454353'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "bank_account_entity" ("id" character varying NOT NULL, "number" character varying NOT NULL, "owner" character varying NOT NULL, "balance" integer NOT NULL, CONSTRAINT "PK_05d1d271b20bb3528fb768930f4" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "bank_account_entity"`);
    }

}
