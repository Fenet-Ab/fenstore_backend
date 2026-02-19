import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CartService {
    constructor(private prisma: PrismaService) { }
    async addToCart(userId: string, materialId: string) {
        let cart = await this.prisma.cart.findFirst({
            where: { userId },
        });

        if (!cart) {
            cart = await this.prisma.cart.create({
                data: { userId },
            });
        }

        const existing = await this.prisma.cartItem.findFirst({
            where: { cartId: cart.id, materialId },
        });

        if (existing) {
            return this.prisma.cartItem.update({
                where: { id: existing.id },
                data: { quantity: existing.quantity + 1 },
            });
        }

        return this.prisma.cartItem.create({
            data: {
                cartId: cart.id,
                materialId,
            },
        });
    }

    async removeFromCart(userId: string, materialId: string) {
        const cart = await this.prisma.cart.findFirst({
            where: { userId },
        });

        if (!cart) return null;

        const existing = await this.prisma.cartItem.findFirst({
            where: { cartId: cart.id, materialId },
        });

        if (!existing) return null;

        if (existing.quantity > 1) {
            return this.prisma.cartItem.update({
                where: { id: existing.id },
                data: { quantity: existing.quantity - 1 },
            });
        }

        return this.prisma.cartItem.delete({
            where: { id: existing.id },
        });
    }

    async deleteFromCart(userId: string, materialId: string) {
        const cart = await this.prisma.cart.findFirst({
            where: { userId },
        });

        if (!cart) return null;

        const existing = await this.prisma.cartItem.findFirst({
            where: { cartId: cart.id, materialId },
        });

        if (!existing) return null;

        return this.prisma.cartItem.delete({
            where: { id: existing.id },
        });
    }

    async getCart(userId: string) {
        return this.prisma.cart.findFirst({
            where: { userId },
            include: {
                items: {
                    include: {
                        material: {
                            include: {
                                category: true
                            }
                        }
                    }
                }
            }
        });
    }

    async clearCart(userId: string) {
        const cart = await this.prisma.cart.findFirst({
            where: { userId },
        });

        if (cart) {
            await this.prisma.cartItem.deleteMany({
                where: { cartId: cart.id },
            });
        }
    }
}
