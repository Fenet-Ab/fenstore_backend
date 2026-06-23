import { Controller, Get, Put, Body, Req, UseGuards, Query, Delete } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@Controller('profile')
export class ProfileController {
    constructor(private profileService: ProfileService) { }

    @UseGuards(JwtGuard)
    @Get()
    getProfile(@Req() req: any) {
        return this.profileService.getProfile(req.user.userId);
    }

    @UseGuards(JwtGuard)
    @Put()
    updateProfile(@Req() req: any, @Body() body: any) {
        return this.profileService.updateProfile(req.user.userId, body);
    }

    @UseGuards(JwtGuard)
    @Get('stats')
    getStats(@Req() req: any) {
        return this.profileService.getStats(req.user.userId);
    }

    @UseGuards(JwtGuard)
    @Delete()
    deleteProfile(@Req() req: any) {
        return this.profileService.deleteProfile(req.user.userId);
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Get('all')
    getAllUsers(@Query('search') search?: string) {
        return this.profileService.getAllUsers(search);
    }
}
