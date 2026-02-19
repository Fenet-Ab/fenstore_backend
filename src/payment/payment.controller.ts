import { Controller, Post, Get, Param, Body, Query } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {

    constructor(private paymentService: PaymentService) { }

    @Post('initialize')
    initialize(@Body() body: any) {
        return this.paymentService.initializePayment(
            body.order,
            body.user,
        );
    }

    @Get('verify/:id')
    verify(@Param('id') id: string, @Query('tx_ref') tx_ref?: string) {
        return this.paymentService.verifyPayment(id, tx_ref);
    }
}
