import { Module } from '@nestjs/common';
import { databaseProviders } from './database.providers';
import { DatabaseController } from './database.controller';

@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
  controllers: [DatabaseController],
})
export class DatabaseModule { }
