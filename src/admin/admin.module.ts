import { Module } from "@nestjs/common";
import { AccountsModule } from "./accounts/accounts.module";
import { ClassAdminModule } from "./class/class.module";

@Module({
    imports: [AccountsModule, ClassAdminModule],
    exports: [AdminModule],
})
export class AdminModule { }