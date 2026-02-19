import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { LikeService } from './like.service';
import { JwtGuard } from 'src/auth/guards/jwt.guard';

@Controller("like")
export class LikeController {
    constructor(private likeService: LikeService) { }

    @Post(":materialId")
    @UseGuards(JwtGuard)
    toggle(
        @Param("materialId") materialId: string,
        @Req() req,
    ) {
        return this.likeService.toggleLike(
            req.user.userId,
            materialId,
        );
    }
    @Get()
    @UseGuards(JwtGuard)
    getLikes(@Req() req) {
        return this.likeService.getUserLikes(req.user.userId);
    }

}

