
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, title: string, message: string, type: string, orderId?: string, link?: string) {
        return this.prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type,
                orderId,
                link,
            },
        });
    }

    async findAll(userId: string) {
        return this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20, // Limit to recent 20
        });
    }

    async markAsRead(id: string) {
        return this.prisma.notification.update({
            where: { id },
            data: { isRead: true },
        });
    }

    async markAllAsRead(userId: string) {
        return this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
    }

    async notifyAdmins(title: string, message: string, type: string, orderId?: string, link?: string) {
        const admins = await this.prisma.user.findMany({
            where: { role: 'ADMIN' },
        });

        for (const admin of admins) {
            await this.create(admin.id, title, message, type, orderId, link);
        }
    }
}
