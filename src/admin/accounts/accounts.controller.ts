import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/utils/guard/authenticate/jwt-auth.guard";
import { RolesGuard } from "src/utils/guard/authorize/role.guard";
import { Roles } from "src/utils/decorator/role.decorator";
import { Role } from "src/utils/enum/role.enum";
import { AccountsService } from "./accounts.service";
import { SearchFilterDto } from "./dto/searchFilter.dto";
import { SearchService } from "src/elastic/search.service";

@ApiTags('Accounts for Admin')
@Controller('accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AccountsController {
    constructor(
        private readonly accountsService: AccountsService,
        private readonly searchService: SearchService
    ) { }

    @Post('/getUsers')
    @ApiOperation({ summary: 'Get users' })
    async getUsers(@Body() filter: SearchFilterDto) {
        return this.accountsService.getUsers(filter);
    }

    async getTeachersPerPage() { }

    async getStudentPerPage() { }

    async getAccountDetail() { }


    @Patch('/banOrUnbanAccount/:userId')
    @ApiOperation({ summary: 'Ban account' })
    @ApiParam({ name: 'userId', type: String })
    async banOrUnbanAccount(@Param() params: any) {
        return this.accountsService.banAccount(params.userId);
    }

    @Get('/elasticSearchAccounts/:text')
    @ApiOperation({ summary: 'Search accounts' })
    @ApiParam({ name: 'text', type: String })
    async searchAccounts(@Param() params: any) {
        return this.searchService.search(params.text);
    }

    async elasticSearchAccounts() { }
}