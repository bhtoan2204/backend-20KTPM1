import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { join } from "path";
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
        synchronize: true,
    };
};

export const typeOrmConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'Toan123456',
    database: 'test2',
    // entities: [join(__dirname, '../', '**', '*.entity.{ts,js}')],
    entities: [User, RefreshToken],
    synchronize: true,
};

export const DatabaseSource = new DataSource({
    ...getDatabaseDataSourceOptions(typeOrmConfig as any),
});