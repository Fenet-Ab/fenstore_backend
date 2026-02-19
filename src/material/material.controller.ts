import { Body, Controller, Delete, Get, Param, Post, Put, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { MaterialService } from './material.service';

@Controller('material')
export class MaterialController {
    constructor(private readonly materialService: MaterialService) { }

    @Get('recent-by-category')
    async findRecentByCategory() {
        const data = await this.materialService.findRecentByCategory();
        return data || [];
    }

    @Get()
    async findAll() {
        return this.materialService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.materialService.findOne(id);
    }

    @Post()
    @UseGuards(JwtGuard, AdminGuard)
    @UseInterceptors(FileInterceptor('image'))
    async createMaterial(
        @UploadedFile() file: Express.Multer.File,
        @Body() body: any,
    ) {
        return this.materialService.createMaterial(file, body);
    }
    @Put(':id')
    @UseGuards(JwtGuard, AdminGuard)
    @UseInterceptors(FileInterceptor('image'))
    async updateMaterial(
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File,
        @Body() body: any,
    ) {
        return this.materialService.updateMaterial(id, file, body);
    }
    @Delete(':id')
    @UseGuards(JwtGuard, AdminGuard)
    async deleteMaterial(@Param('id') id: string) {
        return this.materialService.deleteMaterial(id);
    }




}
