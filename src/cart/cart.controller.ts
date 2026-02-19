import { Body, Controller, Post, Get, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
    constructor(private readonly cartService: CartService) { }
    @Post('add')
    @UseGuards(JwtGuard)
    addToCart(
        @Req() req,
        @Body('materialId') materialId: string,
        @Body('selectedSize') selectedSize?: string,
        @Body('selectedColor') selectedColor?: string,
        @Body('selectedStorage') selectedStorage?: string
    ) {
        console.log("Add to cart - User:", req.user, "MaterialId:", materialId, { selectedSize, selectedColor, selectedStorage });
        return this.cartService.addToCart(req.user.userId, materialId, { selectedSize, selectedColor, selectedStorage });
    }

    @Post('remove')
    @UseGuards(JwtGuard)
    removeFromCart(
        @Req() req,
        @Body('materialId') materialId: string,
        @Body('selectedSize') selectedSize?: string,
        @Body('selectedColor') selectedColor?: string,
        @Body('selectedStorage') selectedStorage?: string
    ) {
        return this.cartService.removeFromCart(req.user.userId, materialId, { selectedSize, selectedColor, selectedStorage });
    }

    @Post('delete')
    @UseGuards(JwtGuard)
    deleteFromCart(
        @Req() req,
        @Body('materialId') materialId: string,
        @Body('selectedSize') selectedSize?: string,
        @Body('selectedColor') selectedColor?: string,
        @Body('selectedStorage') selectedStorage?: string
    ) {
        return this.cartService.deleteFromCart(req.user.userId, materialId, { selectedSize, selectedColor, selectedStorage });
    }

    @Get()
    @UseGuards(JwtGuard)
    getCart(@Req() req) {
        console.log("Get cart - User:", req.user);
        return this.cartService.getCart(req.user.userId);
    }
}
