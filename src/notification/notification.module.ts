
import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [PrismaModule, AuthModule],
    controllers: [NotificationController],
    providers: [NotificationService],
    exports: [NotificationService], // Make it available to other modules
})
export class NotificationModule { }
