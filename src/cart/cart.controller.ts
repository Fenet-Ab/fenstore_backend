import { Body, Controller, Post, Get, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
    constructor(private readonly cartService: CartService) { }
    @Post('add')
    @UseGuards(JwtGuard)
    addToCart(@Req() req, @Body('materialId') materialId: string) {
        console.log("Add to cart - User:", req.user, "MaterialId:", materialId);
        return this.cartService.addToCart(req.user.userId, materialId);
    }

    @Post('remove')
    @UseGuards(JwtGuard)
    removeFromCart(@Req() req, @Body('materialId') materialId: string) {
        return this.cartService.removeFromCart(req.user.userId, materialId);
    }

    @Post('delete')
    @UseGuards(JwtGuard)
    deleteFromCart(@Req() req, @Body('materialId') materialId: string) {
        return this.cartService.deleteFromCart(req.user.userId, materialId);
    }

    @Get()
    @UseGuards(JwtGuard)
    getCart(@Req() req) {
        console.log("Get cart - User:", req.user);
        return this.cartService.getCart(req.user.userId);
    }
}
