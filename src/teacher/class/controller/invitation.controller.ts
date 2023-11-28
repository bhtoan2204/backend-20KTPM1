import { Controller, Get, HttpCode, HttpStatus, Param, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags, ApiOperation, ApiParam } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { CurrentUser } from "src/utils/decorator/current-user.decorator";
import { Request } from "express";
import { InvitationService } from "../service/invitation.service";
import { RolesGuard } from "src/utils/authorize/role.guard";
import { Role } from "src/utils/enum/role.enum";
import { Roles } from "src/utils/decorator/role.decorator";

@ApiTags('Invitation for Teacher')
@Controller('invitation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.TEACHER)
export class InvitationController {
    constructor(
        private readonly invitationService: InvitationService
    ) { }

    @HttpCode(HttpStatus.CREATED)
    @Get('/:classId')
    @ApiOperation({ summary: 'Get invitations of class' })
    @ApiParam({ name: 'classId', type: String })
    async getInvitations(@CurrentUser() user, @Param() params: any, @Req() req: Request) {
        return this.invitationService.getInvitations(user, params.classId, req);
    }

    @HttpCode(HttpStatus.OK)
    @Get('/joinClassByLink/:classToken/:classId')
    @ApiOperation({ summary: 'Join class' })
    @ApiParam({ name: 'classToken', type: String })
    @ApiParam({ name: 'classId', type: String })
    async joinClass(@CurrentUser() user, @Param() params: any) {
        return this.invitationService.joinClass(user, params.classToken, params.classId);
    }

}