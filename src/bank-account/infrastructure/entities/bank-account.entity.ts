import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class BankAccountEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  number: string;

  @Column()
  owner: string;

  @Column('decimal', {
    precision: 15,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => (value ? parseFloat(value) : 0),
    },
  })
  balance: number;
}
