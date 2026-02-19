import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LikeService {
    constructor(private prisma: PrismaService) { }

    async toggleLike(userId: string, materialId: string) {

        const existing = await this.prisma.like.findUnique({
            where: {
                userId_materialId: {
                    userId,
                    materialId,
                },
            },
        });

        // If already liked → remove
        if (existing) {
            await this.prisma.like.delete({
                where: { id: existing.id },
            });

            return { message: "Unliked" };
        }

        // Otherwise add like
        await this.prisma.like.create({
            data: {
                userId,
                materialId,
            },
        });

        return { message: "Liked" };
    }
    async getUserLikes(userId: string) {
        return this.prisma.like.findMany({
            where: { userId },
            include: {
                material: true,
            },
        });
    }

}

