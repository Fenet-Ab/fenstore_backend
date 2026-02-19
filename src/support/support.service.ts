import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SupportService {
    constructor(private prisma: PrismaService) { }

    async sendMessage(userId: string, message: string, isAdmin: boolean = false) {
        return this.prisma.supportMessage.create({
            data: {
                userId,
                message,
                isAdmin,
            },
        });
    }

    async getMessages(userId: string) {
        return this.prisma.supportMessage.findMany({
            where: { userId },
            orderBy: { createdAt: 'asc' },
        });
    }

    async getAllConversations() {
        // This finds unique users who have sent messages
        const messages = await this.prisma.supportMessage.findMany({
            distinct: ['userId'],
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        return messages;
    }

    async getMessagesForAdmin(userId: string) {
        return this.prisma.supportMessage.findMany({
            where: { userId },
            orderBy: { createdAt: 'asc' },
        });
    }
}
