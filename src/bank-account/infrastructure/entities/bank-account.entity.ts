import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class BankAccountEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  number: string;

  @Column()
  owner: string;

  @Column()
  balance: number;
}
