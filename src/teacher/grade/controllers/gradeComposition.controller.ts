import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UseGuards, Delete, UseInterceptors, Patch } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { CreateGradeCompositionDto } from "../../dto/createGradeComposition.dto";
import { CacheInterceptor } from "@nestjs/cache-manager";
import { GradeCompositionService } from "../service/gradeComposition.service";
import { JwtAuthGuard } from "src/utils/guard/authenticate/jwt-auth.guard";
import { CurrentUser } from "src/utils/decorator/current-user.decorator";
import { RolesGuard } from "src/utils/guard/authorize/role.guard";
import { Role } from "src/utils/enum/role.enum";
import { Roles } from "src/utils/decorator/role.decorator";
import { RemoveGradeCompositionDto } from "src/teacher/dto/deleteGradeComposition.dto";
import { UpdateGradeCompositionDto } from "src/teacher/dto/updateGradeComposition.dto";
import { SwapGradeCompositionDto } from "src/teacher/dto/swapGradeComposition.dto";

@ApiTags('Grade Composition for Teacher')
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
    // @UseInterceptors(CacheInterceptor)
    @ApiParam({ name: 'classId', type: String })
    @Get('/getCurentGradeStructure/:classId')
    async getCurentGradeStructure(@CurrentUser() user, @Param() params: any) {
        return this.gradeService.getCurentGradeStructure(user, params.classId);
    }

    @HttpCode(HttpStatus.OK)
    @Delete('/removeGradeCompositions')
    async removeGradeCompositions(@CurrentUser() user, @Body() dto: RemoveGradeCompositionDto) {
        return this.gradeService.removeGradeCompositions(user, dto);
    }

    @HttpCode(HttpStatus.OK)
    @Patch('/updateGradeCompositions/:oldName')
    @ApiOperation({ summary: 'Update grade composition' })
    async updateGradeCompositions(@CurrentUser() user, @Body() dto: UpdateGradeCompositionDto, @Param() params: any) {
        return this.gradeService.updateGradeCompositions(user, dto);
    }

    @HttpCode(HttpStatus.OK)
    @Patch('/swapGradeCompositions/:classId')
    @ApiOperation({ summary: 'Swap grade composition' })
    async swapGradeCompositions(@CurrentUser() user, @Body() dto: SwapGradeCompositionDto) {
        return this.gradeService.swapGradeCompositions(user, dto);
    }
}
