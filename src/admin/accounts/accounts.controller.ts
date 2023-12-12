import { Body, Controller, Get, Param, Patch, Post, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/utils/guard/authenticate/jwt-auth.guard";
import { RolesGuard } from "src/utils/guard/authorize/role.guard";
import { Roles } from "src/utils/decorator/role.decorator";
import { Role } from "src/utils/enum/role.enum";
import { AccountsService } from "./accounts.service";
import { GetUserFilterDto } from "./dto/getUserFilter.dto";
import { SearchService } from "src/elastic/search.service";
import { CacheInterceptor } from "@nestjs/cache-manager";
import { SearchUserDto } from "./dto/searchUser.dto";

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

    @UseInterceptors(CacheInterceptor)
    @Post('/getUsers')
    @ApiOperation({ summary: 'Get users' })
    async getUsers(@Body() filter: GetUserFilterDto) {
        return this.accountsService.getUsers(filter);
    }

    @Patch('/banOrUnbanAccount/:userId')
    @ApiOperation({ summary: 'Ban account' })
    @ApiParam({ name: 'userId', type: String })
    async banOrUnbanAccount(@Param() params: any) {
        return this.accountsService.banAccount(params.userId);
    }

    @Post('/elasticSearchAccounts')
    @ApiOperation({ summary: 'Search accounts' })
    @ApiParam({ name: 'text', type: String })
    async searchAccounts(@Body() dto: SearchUserDto) {
        return this.searchService.search(dto.text, dto.page, dto.perPage);
    }

    @UseInterceptors(CacheInterceptor)
    @Get('/userDetail/:userId')
    @ApiOperation({ summary: 'Get user detail' })
    @ApiParam({ name: 'userId', type: String })
    async userDetail(@Param() params: any) {
        return this.accountsService.userDetail(params.userId);
    }

    @Get('/getClasses')
    @ApiOperation({ summary: 'Get classes' })
    async getClasses() {
        return this.accountsService.getClasses();
    }

    @Get('/getStatistics')
    @ApiOperation({ summary: 'Get statistics' })
    async getStatistics() {
        return this.accountsService.getStatistics();
    }
}