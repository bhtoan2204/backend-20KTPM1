
import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { redisStore } from "cache-manager-redis-yet";

@Module({
    imports: [
        CacheModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                store: await redisStore({
                    url: configService.get<string>('REDIS_URI'),
                    ttl: 100,
                }),
            }),
            isGlobal: true,
            inject: [ConfigService],
        }),
    ],
    exports: [CacheModule]
})
export class LocalCacheModule { }