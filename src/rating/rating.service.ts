import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RatingService {
    constructor(private prisma: PrismaService) { }

    /**
     * Rate a material (create or update rating)
     */
    async rateMaterial(
        userId: string,
        materialId: string,
        value: number,
        comment?: string,
    ) {
        // Validate rating value
        if (value < 1 || value > 5) {
            throw new BadRequestException("Rating must be between 1 and 5");
        }

        // Check if material exists
        const material = await this.prisma.material.findUnique({
            where: { id: materialId },
        });

        if (!material) {
            throw new NotFoundException("Material not found");
        }

        // Upsert the rating
        const rating = await this.prisma.rating.upsert({
            where: {
                userId_materialId: {
                    userId,
                    materialId,
                },
            },
            update: {
                value,
                comment,
            },
            create: {
                userId,
                materialId,
                value,
                comment,
            },
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

        // Update material's average rating and count
        await this.updateMaterialRatingStats(materialId);

        return rating;
    }

    /**
     * Get all ratings for a material
     */
    async getMaterialRatings(materialId: string) {
        const ratings = await this.prisma.rating.findMany({
            where: { materialId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return ratings;
    }

    /**
     * Get average rating and statistics for a material
     */
    async getMaterialRatingStats(materialId: string) {
        const stats = await this.prisma.rating.aggregate({
            where: { materialId },
            _avg: {
                value: true,
            },
            _count: {
                value: true,
            },
        });

        // Get rating distribution (1-5 stars)
        const distribution = await this.getRatingDistribution(materialId);

        return {
            averageRating: stats._avg.value || 0,
            totalRatings: stats._count.value || 0,
            distribution,
        };
    }

    /**
     * Get rating distribution (how many 1-star, 2-star, etc.)
     */
    private async getRatingDistribution(materialId: string) {
        const ratings = await this.prisma.rating.groupBy({
            by: ['value'],
            where: { materialId },
            _count: {
                value: true,
            },
        });

        // Create distribution object
        const distribution = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
        };

        ratings.forEach(rating => {
            distribution[rating.value] = rating._count.value;
        });

        return distribution;
    }

    /**
     * Get user's rating for a material
     */
    async getUserRating(userId: string, materialId: string) {
        const rating = await this.prisma.rating.findUnique({
            where: {
                userId_materialId: {
                    userId,
                    materialId,
                },
            },
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

        return rating;
    }

    /**
     * Delete a rating
     */
    async deleteRating(userId: string, materialId: string) {
        const rating = await this.prisma.rating.findUnique({
            where: {
                userId_materialId: {
                    userId,
                    materialId,
                },
            },
        });

        if (!rating) {
            throw new NotFoundException("Rating not found");
        }

        await this.prisma.rating.delete({
            where: {
                userId_materialId: {
                    userId,
                    materialId,
                },
            },
        });

        // Update material's average rating and count
        await this.updateMaterialRatingStats(materialId);

        return { message: "Rating deleted successfully" };
    }

    /**
     * Update material's cached rating statistics
     */
    private async updateMaterialRatingStats(materialId: string) {
        const stats = await this.prisma.rating.aggregate({
            where: { materialId },
            _avg: {
                value: true,
            },
            _count: {
                value: true,
            },
        });

        await this.prisma.material.update({
            where: { id: materialId },
            data: {
                averageRating: stats._avg.value || 0,
                ratingCount: stats._count.value || 0,
            },
        });
    }

    /**
     * Get all ratings by a user
     */
    async getUserRatings(userId: string) {
        const ratings = await this.prisma.rating.findMany({
            where: { userId },
            include: {
                material: {
                    select: {
                        id: true,
                        title: true,
                        imageUrl: true,
                        price: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return ratings;
    }

    /**
     * Get top rated materials
     */
    async getTopRatedMaterials(limit: number = 10) {
        const materials = await this.prisma.material.findMany({
            where: {
                ratingCount: {
                    gt: 0, // Only materials with at least one rating
                },
            },
            orderBy: {
                averageRating: 'desc',
            },
            take: limit,
            include: {
                category: true,
                ratings: {
                    take: 3,
                    orderBy: {
                        createdAt: 'desc',
                    },
                    include: {
                        user: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        return materials;
    }
}
