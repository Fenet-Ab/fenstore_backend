import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtGuard implements CanActivate {
    constructor(private jwtService: JwtService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (!authHeader) return false;

        const token = authHeader.split(' ')[1];

        try {
            const decoded = this.jwtService.verify(token);

            request.user = decoded;
            return true;
        } catch {
            return false;
        }
    }
}
