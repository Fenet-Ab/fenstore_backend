import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding categories...');

    const categories = [
        'Electronics',
        'Clothing',
        'Accessories',
        'Home Decor',
        'Jewelry',
        'Watches',
        'Bags & Luggage',
        'Shoes',
        'Books',
        'Sports & Outdoors',
    ];

    for (const name of categories) {
        try {
            const category = await prisma.category.create({
                data: { name },
            });
            console.log(`✓ Created category: ${category.name}`);
        } catch (error) {
            console.log(`✗ Category "${name}" already exists or error occurred`);
        }
    }

    console.log('Seeding completed!');
}

main()
    .catch((e) => {
        console.error('Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
