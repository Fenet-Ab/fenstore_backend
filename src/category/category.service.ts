import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoryService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.category.findMany({
            orderBy: {
                name: 'asc',
            },
        });
    }

    async findOne(id: string) {
        return this.prisma.category.findUnique({
            where: { id },
            include: {
                materials: true,
            },
        });
    }

    async create(name: string) {
        return this.prisma.category.create({
            data: { name },
        });
    }

    async delete(id: string) {
        return this.prisma.category.delete({
            where: { id },
        });
    }
}
