import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UseGuards, Delete, UseInterceptors, Patch } from "@nestjs/common";
import { ApiBearerAuth, ApiParam, ApiTags } from "@nestjs/swagger";
import { GradeService } from "./grade.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorator/current-user.decorator";
import { CreateGradeCompositionDto } from "./dto/createGradeComposition.dto";
import { CacheInterceptor } from "@nestjs/cache-manager";

@ApiTags('gradeComposition')
@Controller('gradeComposition')
@ApiBearerAuth()
export class GradeCompositionController {
    constructor(
        private readonly gradeService: GradeService
    ) { }

    @HttpCode(HttpStatus.CREATED)
    @UseGuards(JwtAuthGuard)
    @Post('/create')
    async create(@CurrentUser() user, @Body() dto: CreateGradeCompositionDto) {
        return this.gradeService.createGradeComposition(user, dto);
    }

    @HttpCode(HttpStatus.CREATED)
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(CacheInterceptor)
    @ApiParam({ name: 'classId', type: String })
    @Get('/getCurentGradeStructure/:classId')
    async getCurentGradeStructure(@CurrentUser() user, @Param() params: any) {
        return this.gradeService.getCurentGradeStructure(user, params.classId);
    }

    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    @ApiParam({ name: 'classId', type: String })
    @ApiParam({ name: 'gradeCompoId', type: String })
    @Delete('/removeGradeCompositions/:classId/:gradeCompoId')
    async removeGradeCompositions(@CurrentUser() user, @Param() params: any) {
        return this.gradeService.removeGradeCompositions(user, params.classId, params.gradeCompoId);
    }

    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    @Patch('/updateGradeCompositions/:gradeCompoId')
    @ApiParam({ name: 'gradeCompoId', type: String })
    async updateGradeCompositions(@CurrentUser() user, @Param() params: any, @Body() dto: CreateGradeCompositionDto) {
        return this.gradeService.updateGradeCompositions(user, params.classId, params.gradeCompoId, dto);
    }

    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(CacheInterceptor)
    @Get('/getGradeCompositions/:classId')
    @ApiParam({ name: 'classId', type: String })
    async getAcesndingGradeCompositions(@CurrentUser() user, @Param() params: any) {
        return this.gradeService.getAcesndingGradeCompositions(user, params.classId);
    }

    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(CacheInterceptor)
    @Get('/getGradeCompositions/:classId')
    @ApiParam({ name: 'classId', type: String })
    async getDescendingGradeCompositions(@CurrentUser() user, @Param() params: any) {
        return this.gradeService.getDescendingGradeCompositions(user, params.classId);
    }


}

