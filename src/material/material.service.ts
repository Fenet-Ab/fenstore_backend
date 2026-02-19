import { Injectable } from '@nestjs/common';
import { supabase } from '../config/superbase';
import { v4 as uuid } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';


@Injectable()
export class MaterialService {
  constructor(private prisma: PrismaService) { }

  async findAll() {
    return this.prisma.material.findMany({
      where: {
        isDeleted: false,
      },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.material.findFirst({
      where: {
        id,
        isDeleted: false
      },
      include: {
        category: true,
      },
    });
  }

  async uploadImage(file: Express.Multer.File) {
    const fileName = `${uuid()}-${file.originalname}`;

    const { error } = await supabase.storage
      .from('materials')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) throw new Error(error.message);

    const { data } = supabase.storage
      .from('materials')
      .getPublicUrl(fileName);

    return data;
  }
  async createMaterial(file: Express.Multer.File, body: any) {
    const imageUrl = await this.uploadImage(file);

    return this.prisma.material.create({
      data: {
        title: body.title,
        description: body.description,
        categoryId: body.categoryId,
        price: parseFloat(body.price || '0'),
        imageUrl: imageUrl.publicUrl,
      },
    });
  }
  async updateMaterial(id: string, file: Express.Multer.File, body: any) {
    let updateData: any = {
      title: body.title,
      description: body.description,
      categoryId: body.categoryId,
      price: parseFloat(body.price || '0'),
    };

    if (file) {
      const imageUrl = await this.uploadImage(file);
      updateData.imageUrl = imageUrl.publicUrl;
    }

    return this.prisma.material.update({
      where: { id },
      data: updateData,
    });
  }
  async deleteMaterial(id: string) {
    // Check if exists
    const material = await this.prisma.material.findUnique({
      where: { id },
    });

    if (!material) throw new Error('Material not found');

    // Remove from carts so users don't see deleted items
    await this.prisma.cartItem.deleteMany({
      where: { materialId: id }
    });

    // Soft delete
    await this.prisma.material.update({
      where: { id },
      data: { isDeleted: true },
    });

    return { message: 'Material deleted successfully' };
  }



  async findRecentByCategory() {
    const materials = await this.prisma.material.findMany({
      where: { isDeleted: false },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });

    const results: any[] = [];
    const seenCategories = new Set();

    for (const m of materials) {
      if (!seenCategories.has(m.categoryId)) {
        results.push(m);
        seenCategories.add(m.categoryId);
      }
    }

    return results;
  }
}
