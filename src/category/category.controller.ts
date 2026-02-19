import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { CategoryService } from './category.service';

@Controller('category')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) { }

    @Get()
    async findAll() {
        return this.categoryService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.categoryService.findOne(id);
    }

    @Post()
    async create(@Body('name') name: string) {
        return this.categoryService.create(name);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.categoryService.delete(id);
    }
}
