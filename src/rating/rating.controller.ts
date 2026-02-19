import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { RatingService } from './rating.service';
import { CreateRatingDto } from './dto/create-rating.dto';

@Controller('rating')
export class RatingController {
    constructor(private readonly ratingService: RatingService) { }

    /**
     * Rate a material (create or update)
     * POST /rating/:materialId
     */
    @Post(":materialId")
    @UseGuards(JwtGuard)
    async rateMaterial(
        @Param("materialId") materialId: string,
        @Body() createRatingDto: CreateRatingDto,
        @Req() req,
    ) {
        return this.ratingService.rateMaterial(
            req.user.userId,
            materialId,
            createRatingDto.value,
            createRatingDto.comment,
        );
    }

    /**
     * Get all ratings for a material
     * GET /rating/material/:materialId
     */
    @Get("material/:materialId")
    async getMaterialRatings(@Param("materialId") materialId: string) {
        return this.ratingService.getMaterialRatings(materialId);
    }

    /**
     * Get rating statistics for a material
     * GET /rating/material/:materialId/stats
     */
    @Get("material/:materialId/stats")
    async getMaterialRatingStats(@Param("materialId") materialId: string) {
        return this.ratingService.getMaterialRatingStats(materialId);
    }

    /**
     * Get current user's rating for a material
     * GET /rating/my/:materialId
     */
    @Get("my/:materialId")
    @UseGuards(JwtGuard)
    async getMyRating(
        @Param("materialId") materialId: string,
        @Req() req,
    ) {
        return this.ratingService.getUserRating(req.user.userId, materialId);
    }

    /**
     * Get all ratings by current user
     * GET /rating/my
     */
    @Get("my")
    @UseGuards(JwtGuard)
    async getMyRatings(@Req() req) {
        return this.ratingService.getUserRatings(req.user.userId);
    }

    /**
     * Delete current user's rating for a material
     * DELETE /rating/:materialId
     */
    @Delete(":materialId")
    @UseGuards(JwtGuard)
    async deleteRating(
        @Param("materialId") materialId: string,
        @Req() req,
    ) {
        return this.ratingService.deleteRating(req.user.userId, materialId);
    }

    /**
     * Get top rated materials
     * GET /rating/top
     */
    @Get("top")
    async getTopRatedMaterials(@Query("limit") limit?: string) {
        const limitNum = limit ? parseInt(limit, 10) : 10;
        return this.ratingService.getTopRatedMaterials(limitNum);
    }
}
