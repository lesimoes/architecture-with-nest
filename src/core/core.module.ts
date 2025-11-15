import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';

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
    MongooseModule.forRoot('mongodb://localhost:27018/vf-event-store', {
      connectionName: 'event-store',
      directConnection: true,
    }),
  ],
})
export class CoreModule {}
