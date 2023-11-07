import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { RefreshToken } from "src/auth/entity/refreshToken.entity";
import { User } from "src/user/entity/user.entity";
import { DataSource, DataSourceOptions } from "typeorm";

export const getDatabaseDataSourceOptions = ({
    port,
    host,
    username,
    database,
    schema,
    password,
}): DataSourceOptions => {
    return {
        type: 'postgres',
        port,
        host,
        username,
        database,
        schema,
        password: password,
        entities: [User, RefreshToken],
    };
};

const configService = new ConfigService();

export const typeOrmConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_DATABASE'),
    entities: [User, RefreshToken],
    synchronize: true,
};

export const DatabaseSource = new DataSource({
    ...getDatabaseDataSourceOptions(typeOrmConfig as any),
});