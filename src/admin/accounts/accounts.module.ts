import { Module } from "@nestjs/common";
import { AccountsController } from "./accounts.controller";
import { AccountsService } from "./accounts.service";
import { MongooseModule } from "@nestjs/mongoose";
import { UserSchema } from "src/utils/schema/user.schema";
import { SearchService } from "src/elastic/search.service";
import { ElasticsearchModule } from "@nestjs/elasticsearch";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { SearchModule } from "src/elastic/search.module";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
        SearchModule,
    ],
    controllers: [AccountsController],
    providers: [AccountsService, SearchService],
})
export class AccountsModule { }