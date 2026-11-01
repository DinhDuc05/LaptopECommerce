import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = await bcrypt.hash('Admin@123', 12);
  const customerPasswordHash = await bcrypt.hash('Customer@123', 12);

  await prisma.user.upsert({
    where: { email: 'admin@laptopstore.vn' },
    update: { passwordHash: adminPasswordHash, role: 'ADMIN', isActive: true },
    create: {
      email: 'admin@laptopstore.vn',
      passwordHash: adminPasswordHash,
      fullName: 'Quản Trị Viên',
      phone: '0901234567',
      role: 'ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { email: 'nguyenvana@gmail.com' },
    update: { passwordHash: customerPasswordHash, role: 'CUSTOMER', isActive: true },
    create: {
      email: 'nguyenvana@gmail.com',
      passwordHash: customerPasswordHash,
      fullName: 'Nguyễn Văn A',
      phone: '0987654321',
      role: 'CUSTOMER',
    },
  });

  const categories = [
    ['Laptop Mỏng Nhẹ', 'laptop-mong-nhe'],
    ['Laptop Doanh Nhân', 'laptop-doanh-nhan'],
    ['Laptop Gaming', 'laptop-gaming'],
    ['Laptop Sinh Viên - Văn Phòng', 'laptop-sinh-vien-van-phong'],
    ['Laptop Đồ Họa - Kỹ Thuật', 'laptop-do-hoa-ky-thuat'],
  ] as const;

  for (const [name, slug] of categories) {
    await prisma.category.upsert({
      where: { slug },
      update: { name },
      create: { name, slug },
    });
  }

  const brands = [
    ['Apple', 'apple'],
    ['Dell', 'dell'],
    ['Asus', 'asus'],
    ['Lenovo', 'lenovo'],
    ['HP', 'hp'],
  ] as const;

  for (const [name, slug] of brands) {
    await prisma.brand.upsert({
      where: { slug },
      update: { name },
      create: { name, slug },
    });
  }

  const products = [
    ['Apple MacBook Air M2 13.6 inch', 'apple-macbook-air-m2-13-6-inch', 'apple', 'laptop-mong-nhe', 24990000],
    ['Dell XPS 13 Plus 9320', 'dell-xps-13-plus-9320', 'dell', 'laptop-doanh-nhan', 36500000],
    ['Asus ROG Zephyrus G14 GA402', 'asus-rog-zephyrus-g14-ga402', 'asus', 'laptop-gaming', 29990000],
    ['Lenovo ThinkPad T14s Gen 4', 'lenovo-thinkpad-t14s-gen-4', 'lenovo', 'laptop-doanh-nhan', 28990000],
    ['HP Pavilion Plus 14', 'hp-pavilion-plus-14', 'hp', 'laptop-sinh-vien-van-phong', 18990000],
  ] as const;

  for (const [name, slug, brandSlug, categorySlug, price] of products) {
    const brand = await prisma.brand.findUniqueOrThrow({ where: { slug: brandSlug } });
    const category = await prisma.category.findUniqueOrThrow({ where: { slug: categorySlug } });
    const product = await prisma.product.upsert({
      where: { slug },
      update: { name, brandId: brand.id, categoryId: category.id, isActive: true },
      create: {
        name,
        slug,
        brandId: brand.id,
        categoryId: category.id,
        thumbnailUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
        summary: `${name} chính hãng`,
        description: `${name} phù hợp cho học tập, làm việc và giải trí.`,
        isFeatured: true,
      },
    });

    await prisma.productVariant.upsert({
      where: { sku: `SEED-${product.id}` },
      update: { price, stockQuantity: 10, isActive: true },
      create: {
        productId: product.id,
        sku: `SEED-${product.id}`,
        cpu: 'Intel Core i5',
        ramGb: 16,
        storage: '512GB SSD',
        vga: 'Integrated Graphics',
        screenSize: '14 inch',
        color: 'Gray',
        price,
        originalPrice: price + 3000000,
        stockQuantity: 10,
      },
    });
  }

  console.log('Supabase seed completed successfully.');
}

main()
  .catch((error) => {
    console.error('Supabase seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
