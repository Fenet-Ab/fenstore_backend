import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class OrderService {
    constructor(
        private prisma: PrismaService,
        private notificationService: NotificationService
    ) { }

    async createOrderFromCart(userId: string, shippingAddress: string, useLoyaltyPoints: boolean = false) {
        // 1️⃣ Find user and cart
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                carts: {
                    include: {
                        items: {
                            include: {
                                material: true,
                            },
                        },
                    },
                }
            }
        });

        const cart = user?.carts[0];

        if (!cart || cart.items.length === 0) {
            throw new BadRequestException("Cart is empty");
        }

        // Calculate total first
        let total = 0;
        for (const item of cart.items) {
            total += item.material.price * item.quantity;
        }

        // Apply Loyalty Discount
        let discount = 0;
        if (useLoyaltyPoints && user.loyaltyPoints >= 10) {
            discount = user.loyaltyPoints; // 1 point = 1 ETB
            total = Math.max(0, total - discount);

            // Deduct points immediately
            await this.prisma.user.update({
                where: { id: userId },
                data: { loyaltyPoints: 0 }
            });
            console.log(`Applied ${discount} ETB discount from loyalty points for user ${userId}`);
        } else if (useLoyaltyPoints && user.loyaltyPoints > 0) {
            console.log(`User ${userId} tried to use loyalty points but has less than 10 (${user.loyaltyPoints})`);
        }

        // 2️⃣ Create order with total price
        const order = await this.prisma.order.create({
            data: {
                userId,
                totalPrice: total,
                shippingAddress,
                items: {
                    create: cart.items.map(item => ({
                        materialId: item.materialId,
                        quantity: item.quantity,
                        price: item.material.price,
                        selectedSize: item.selectedSize,
                        selectedColor: item.selectedColor,
                        selectedStorage: item.selectedStorage,
                    }))
                }
            },
            include: {
                items: true,
                user: true
            }
        });

        // 3️⃣ Clear cart
        await this.prisma.cartItem.deleteMany({
            where: { cartId: cart.id },
        });

        // 4️⃣ Notify Admins
        await this.notificationService.notifyAdmins(
            "New Order Received",
            `User ${order.user.name} has placed a new order #${order.id.slice(0, 8)} worth ${total} ETB.${discount > 0 ? ` (Discounted by ${discount} points)` : ''}`,
            "NEW_ORDER",
            order.id,
            `/admin/orders/${order.id}`
        );

        // 5️⃣ Return ready order
        return order;
    }

    async getUserOrders(userId: string, search?: string) {
        return this.prisma.order.findMany({
            where: {
                userId,
                ...(search && {
                    OR: [
                        { id: { contains: search, mode: 'insensitive' } },
                        {
                            items: {
                                some: {
                                    material: {
                                        title: { contains: search, mode: 'insensitive' }
                                    }
                                }
                            }
                        }
                    ]
                })
            },
            include: {
                items: {
                    include: {
                        material: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async getOrderById(orderId: string) {
        return this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: {
                        material: true,
                    },
                },
            },
        });
    }

    async deleteOrder(userId: string, orderId: string) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId }
        });

        if (!order) {
            throw new BadRequestException("Order not found");
        }

        if (order.userId !== userId) {
            throw new BadRequestException("Unauthorized to delete this order");
        }

        if (order.paymentStatus === "PAID") {
            throw new BadRequestException("Cannot delete a paid order");
        }

        return this.prisma.$transaction(async (tx) => {
            // Delete order items first
            await tx.orderItem.deleteMany({
                where: { orderId }
            });

            // Delete the order
            await tx.order.delete({
                where: { id: orderId }
            });

            return { message: "Order removed successfully" };
        });
    }

    async updateDeliveryStatus(orderId: string, status: string) {
        const order = await this.prisma.order.update({
            where: { id: orderId },
            data: { deliveryStatus: status },
            include: { user: true }
        });

        // Notify User
        await this.notificationService.create(
            order.userId,
            "Order Status Updated",
            `Your order #${order.id.slice(0, 8)} status has been updated to ${status}.`,
            "ORDER_UPDATE",
            order.id,
            `/orders/${order.id}`
        );

        return order;
    }

    async getMarketShare() {
        console.log("Starting getMarketShare calculation...");
        try {
            const orders = await this.prisma.order.findMany({
                where: { paymentStatus: 'PAID' },
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
            console.log(`Found ${orders.length} paid orders.`);

            const categorySales: Record<string, number> = {};
            let totalSales = 0;

            for (const order of orders) {
                if (!order.items) continue;
                for (const item of order.items) {
                    if (!item.material || !item.material.category) {
                        console.log(`Skipping item ${item.id} due to missing material or category.`);
                        continue;
                    }
                    const categoryName = item.material.category.name;
                    const saleAmount = item.price * item.quantity;

                    if (!categorySales[categoryName]) {
                        categorySales[categoryName] = 0;
                    }
                    categorySales[categoryName] += saleAmount;
                    totalSales += saleAmount;
                }
            }
            console.log("Category sales calculated:", categorySales);
            console.log("Total sales:", totalSales);

            const marketShare = Object.keys(categorySales).map(category => {
                const amount = categorySales[category];
                const percentage = totalSales > 0 ? (amount / totalSales) * 100 : 0;
                return {
                    label: category,
                    percentage: Math.round(percentage),
                    color: "#D4AF37"
                };
            });

            return marketShare.sort((a, b) => b.percentage - a.percentage);
        } catch (error) {
            console.error("Critical error in getMarketShare:", error);
            throw error;
        }
    }

    async getAllOrders(search?: string) {
        return this.prisma.order.findMany({
            where: {
                ...(search && {
                    OR: [
                        { id: { contains: search, mode: 'insensitive' } },
                        { user: { name: { contains: search, mode: 'insensitive' } } },
                        {
                            items: {
                                some: {
                                    material: {
                                        title: { contains: search, mode: 'insensitive' }
                                    }
                                }
                            }
                        }
                    ]
                })
            },
            include: {
                user: true,
                items: {
                    include: {
                        material: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
}
