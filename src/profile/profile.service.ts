import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfileService {
    constructor(private prisma: PrismaService) { }

    async getProfile(userId: string) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                loyaltyPoints: true,
            },
        });
    }

    async updateProfile(userId: string, data: any) {
        return this.prisma.user.update({
            where: { id: userId },
            data,
        });
    }
    async deleteProfile(userId: string) {
        await this.prisma.user.delete({
            where: { id: userId },
        });

        return {
            message: 'Account deleted successfully',
        };
    }
    async getAllUsers(search?: string) {
        console.log('Fetching all users for admin...');
        const users = await this.prisma.user.findMany({
            where: {
                ...(search && {
                    OR: [
                        { name: { contains: search, mode: 'insensitive' } },
                        { email: { contains: search, mode: 'insensitive' } },
                    ]
                })
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        console.log(`Successfully retrieved ${users.length} users.`);
        return users;
    }

    async getStats(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { loyaltyPoints: true }
        });

        const orders = await this.prisma.order.findMany({
            where: { userId }
        });

        // Active: Either not paid yet OR not delivered yet
        const activeOrdersCount = orders.filter(o =>
            o.paymentStatus !== "PAID" || o.deliveryStatus !== "DELIVERED"
        ).length;

        // Paid: Truly acquired items
        const paidOrders = orders.filter(o => o.paymentStatus === "PAID");
        const totalSpent = paidOrders.reduce((acc, o) => acc + o.totalPrice, 0);

        return {
            loyaltyPoints: user?.loyaltyPoints || 0,
            totalSpent,
            activeOrders: activeOrdersCount,
            totalAcquisitions: paidOrders.length,
            totalOrders: orders.length
        };
    }
}
