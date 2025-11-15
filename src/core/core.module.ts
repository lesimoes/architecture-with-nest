import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'admin',
      password: '123456',
      database: 'treta-bank',
      autoLoadEntities: true,
      migrations: ['dist/migrations/*.js'],
      migrationsRun: false,
    }),
  ],
})
export class CoreModule {}
