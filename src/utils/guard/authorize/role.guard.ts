import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { ROLES_KEY } from "../../decorator/role.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    matchRoles(allowedRoles: any, userRole: string): boolean {
        return allowedRoles.includes(userRole);
    }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const roles = this.reflector.getAllAndOverride<boolean>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!roles) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        return this.matchRoles(roles, user.role);
    }
}