
import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtGuard } from '../auth/guards/jwt.guard';

@Controller('notification')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }

    @UseGuards(JwtGuard)
    @Post()
    create(@Body() createNotificationDto: any) { // Should validate DTO properly
        // This is mainly for testing or future use
        return this.notificationService.create(createNotificationDto.userId, createNotificationDto.title, createNotificationDto.message, createNotificationDto.type, createNotificationDto.orderId, createNotificationDto.link);
    }

    @UseGuards(JwtGuard)
    @Get()
    findAll(@Req() req) {
        return this.notificationService.findAll(req.user.userId);
    }

    @UseGuards(JwtGuard)
    @Patch(':id/read')
    markAsRead(@Param('id') id: string) {
        return this.notificationService.markAsRead(id);
    }

    @UseGuards(JwtGuard)
    @Patch('read-all')
    markAllAsRead(@Req() req) {
        return this.notificationService.markAllAsRead(req.user.userId);
    }
}
