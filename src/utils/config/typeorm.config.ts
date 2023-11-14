import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { join } from "path";
import { RefreshToken } from "../../auth/entity/refreshToken.entity";
import { User } from "../../user/entity/user.entity";
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
    ssl: {
      rejectUnauthorized: false,
    },
  };
};


export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'dpg-cl6egmquuipc73cbo7f0-a.singapore-postgres.render.com',
  port: 5432,
  username: 'classroom_30wr_user',
  password: 'RWLy8uF0mprZrGuQ9czGpbWtkxrv6Wjr',
  database: 'classroom_30wr',
  // entities: [join(__dirname, '../', '**', '*.entity.{ts,js}')],
  entities: [User, RefreshToken],
  synchronize: true,
  ssl: {
    rejectUnauthorized: false,
  },
};

export const DatabaseSource = new DataSource({
  ...getDatabaseDataSourceOptions(typeOrmConfig as any),
});