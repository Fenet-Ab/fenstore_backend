import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PaymentService {
    constructor(private prisma: PrismaService) { }

    async initializePayment(order: any, user: any) {
        try {
            // Chapa requires a unique tx_ref for every attempt.
            const uniqueTxRef = `FEN-${order.id.slice(-4)}-${Date.now()}`;

            console.log(`[PAYMENT INIT] Saving uniqueTxRef for Order ${order.id}: ${uniqueTxRef}`);

            // Save the unique reference to the order database so we can verify later
            await this.prisma.order.update({
                where: { id: order.id },
                data: { txRef: uniqueTxRef }
            });

            const response = await axios.post(
                'https://api.chapa.co/v1/transaction/initialize',
                {
                    amount: order.totalPrice,
                    currency: 'ETB',
                    email: user.email,
                    first_name: user.firstName || 'User',
                    last_name: user.lastName || 'FenStore',
                    tx_ref: uniqueTxRef,
                    callback_url: 'http://localhost:5000/api/payment/verify/' + order.id,
                    return_url: `http://localhost:3000/orders?verify=${order.id}&tx_ref=${uniqueTxRef}`,
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
                    },
                },
            );

            return response.data;
        } catch (error) {
            console.error("Chapa Initialization Error:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || "Failed to initialize payment with Chapa");
        }
    }

    async verifyPayment(orderId: string, txRef?: string) {
        // Fetch order details first
        const dbOrder = await this.prisma.order.findUnique({
            where: { id: orderId },
            select: { txRef: true, paymentStatus: true, userId: true }
        });

        if (!dbOrder) {
            return { status: 'failed', message: 'Order not found' };
        }

        // If already paid, return success immediately to prevent double counting
        if (dbOrder.paymentStatus === 'PAID') {
            return { status: 'success', message: 'Payment already verified', data: null };
        }

        let reference = txRef || dbOrder.txRef;

        console.log(`[VERIFY] Verifying with Chapa. Order: ${orderId}, Reference: ${reference || 'NOT_FOUND'}`);

        if (!reference) {
            return { status: 'failed', message: 'No transaction reference found for this order. Please try paying again.' };
        }

        try {
            const response = await axios.get(
                `https://api.chapa.co/v1/transaction/verify/${reference}`,
                {
                    headers: {
                        Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
                    },
                    validateStatus: () => true
                },
            );

            console.log("CHAPA VERIFY RESPONSE:", JSON.stringify(response.data));

            const status = response.data?.status;
            const dataStatus = response.data?.data?.status;

            if (status === 'success' || dataStatus === 'success') {
                await this.prisma.order.update({
                    where: { id: orderId },
                    data: { paymentStatus: 'PAID' },
                });
                console.log(`Order ${orderId} marked as PAID`);

                // Add Loyalty Points: 5 points per successful order
                await this.prisma.user.update({
                    where: { id: dbOrder.userId },
                    data: {
                        loyaltyPoints: { increment: 5 }
                    }
                });
                console.log(`User ${dbOrder.userId} awarded 5 loyalty points.`);

                return { status: 'success', message: 'Payment verified successfully', data: response.data.data };
            }

            return response.data;
        } catch (error) {
            console.error("Verification Error:", error.message);
            return { status: 'failed', message: error.message };
        }
    }


}
