import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UseGuards, Delete, UseInterceptors, Patch } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { CreateGradeCompositionDto } from "../dto/createGradeComposition.dto";
import { CacheInterceptor } from "@nestjs/cache-manager";
import { GradeCompositionService } from "../service/gradeComposition.service";
import { JwtAuthGuard } from "src/auth/guards/AuthGuard/jwt-auth.guard";
import { CurrentUser } from "src/utils/decorator/current-user.decorator";
import { RolesGuard } from "src/utils/authorize/role.guard";
import { Role } from "src/utils/enum/role.enum";
import { Roles } from "src/utils/decorator/role.decorator";

@ApiTags('gradeComposition')
@Controller('gradeComposition')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.TEACHER)
export class GradeCompositionController {
    constructor(
        private readonly gradeService: GradeCompositionService
    ) { }

    @HttpCode(HttpStatus.CREATED)
    @Post('/create')
    async create(@CurrentUser() user, @Body() dto: CreateGradeCompositionDto) {
        return this.gradeService.createGradeComposition(user, dto);
    }

    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(CacheInterceptor)
    @ApiParam({ name: 'classId', type: String })
    @Get('/getCurentGradeStructure/:classId')
    async getCurentGradeStructure(@CurrentUser() user, @Param() params: any) {
        return this.gradeService.getCurentGradeStructure(user, params.classId);
    }

    @HttpCode(HttpStatus.OK)
    @ApiParam({ name: 'classId', type: String })
    @ApiParam({ name: 'gradeCompoId', type: String })
    @Delete('/removeGradeCompositions/:classId/:gradeCompoId')
    async removeGradeCompositions(@CurrentUser() user, @Param() params: any) {
        return this.gradeService.removeGradeCompositions(user, params.classId, params.gradeCompoId);
    }

    @HttpCode(HttpStatus.OK)
    @Patch('/updateGradeCompositions/:oldName')
    @ApiOperation({ summary: 'Update grade composition' })
    async updateGradeCompositions(@CurrentUser() user, @Body() dto: CreateGradeCompositionDto, @Param() params: any) {
        return this.gradeService.updateGradeCompositions(user, dto, params.oldName);
    }

}
