import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { CartController } from './cart.controller';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [CartService],
  controllers: [CartController]
})
export class CartModule { }
