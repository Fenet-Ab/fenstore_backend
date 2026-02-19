import { Controller, Get, Post, Body, Req, UseGuards, Param } from '@nestjs/common';
import { SupportService } from './support.service';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('support')
export class SupportController {
    constructor(private readonly supportService: SupportService) { }

    @Post('send')
    @UseGuards(JwtGuard)
    sendMessage(@Req() req, @Body('message') message: string) {
        console.log(`[Support] User ${req.user.userId} is sending a message`);
        return this.supportService.sendMessage(req.user.userId, message, false);
    }

    @Get('messages')
    @UseGuards(JwtGuard)
    getMessages(@Req() req) {
        console.log(`[Support] Fetching messages for user ${req.user.userId}`);
        return this.supportService.getMessages(req.user.userId);
    }

    // Admin Endpoints
    @Get('admin/conversations')
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(Role.ADMIN)
    getAllConversations() {
        return this.supportService.getAllConversations();
    }

    @Get('admin/messages/:userId')
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(Role.ADMIN)
    getMessagesForAdmin(@Param('userId') userId: string) {
        return this.supportService.getMessagesForAdmin(userId);
    }

    @Post('admin/reply')
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(Role.ADMIN)
    replyToMessage(@Body('userId') userId: string, @Body('message') message: string) {
        return this.supportService.sendMessage(userId, message, true);
    }
}
