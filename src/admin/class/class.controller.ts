import { Body, Controller, Get, HttpStatus, Param, Post, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { Roles } from "src/utils/decorator/role.decorator";
import { Role } from "src/utils/enum/role.enum";
import { JwtAuthGuard } from "src/utils/guard/authenticate/jwt-auth.guard";
import { RolesGuard } from "src/utils/guard/authorize/role.guard";
import { ClassAdminService } from "./class.service";
import { CacheInterceptor } from "@nestjs/cache-manager";
import { GetClassesFilterDto } from "./dto/getClassFilter.dto";

@Controller('class')
@ApiTags('Class for Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class ClassAdminController {
    constructor(
        private readonly classAdminService: ClassAdminService,
    ) { }

    @UseInterceptors(CacheInterceptor)
    @Post('/getClasses')
    @ApiOperation({ summary: 'Get classes' })
    async getClasses(@Body() dto: GetClassesFilterDto) {
        return this.classAdminService.getClasses(dto);
    }

    @UseInterceptors(CacheInterceptor)
    @Get('/getClassDetail/:classId')
    @ApiParam({ name: 'classId', type: String })
    @ApiOperation({ summary: 'Get class detail' })
    async getClassDetail(@Param() params: any) {
        return this.classAdminService.getClassDetail(params.classId);
    }
}