import bcrypt from 'bcryptjs';
import { Category, Brand, Product, ProductVariant, Order, OrderItem, Review, User, AuthUser, UserRole } from '../types';
import { getPrismaClient, isDatabaseActive } from '../config/prisma';

// Dữ liệu người dùng mẫu (Hỗ trợ phân quyền ADMIN và CUSTOMER)
let users: User[] = [
  {
    id: 1,
    email: 'admin@laptopstore.vn',
    passwordHash: bcrypt.hashSync('Admin@123', 10),
    fullName: 'Quản Trị Viên Hệ Thống',
    phone: '0901234567',
    role: 'ADMIN',
    isActive: true,
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-01T08:00:00Z',
  },
  {
    id: 2,
    email: 'nguyenvana@gmail.com',
    passwordHash: bcrypt.hashSync('Customer@123', 10),
    fullName: 'Nguyễn Văn A',
    phone: '0987654321',
    role: 'CUSTOMER',
    isActive: true,
    createdAt: '2026-10-15T09:30:00Z',
    updatedAt: '2026-10-15T09:30:00Z',
  },
];

// Dữ liệu mẫu nạp sẵn (Seed in-memory siêu tốc, chiếm < 5MB RAM)
let categories: Category[] = [
  { id: 1, name: 'Laptop Mỏng Nhẹ', slug: 'laptop-mong-nhe', description: 'Laptop Ultrabook siêu mỏng nhẹ, pin trâu, tiện di chuyển', displayOrder: 1 },
  { id: 2, name: 'Laptop Doanh Nhân', slug: 'laptop-doanh-nhan', description: 'Thiết kế sang trọng, bảo mật vân tay cao cấp', displayOrder: 2 },
  { id: 3, name: 'Laptop Gaming', slug: 'laptop-gaming', description: 'Cấu hình khủng, card đồ họa rời chuyên chiến game', displayOrder: 3 },
  { id: 4, name: 'Laptop Sinh Viên - Văn Phòng', slug: 'laptop-sinh-vien-van-phong', description: 'Giá cả hợp lý, đáp ứng mượt mà học tập và văn phòng', displayOrder: 4 },
  { id: 5, name: 'Laptop Đồ Họa - Kỹ Thuật', slug: 'laptop-do-hoa-ky-thuat', description: 'Màn hình chuẩn màu, hiệu năng CPU và GPU đa nhân', displayOrder: 5 },
];

let brands: Brand[] = [
  { id: 1, name: 'Apple', slug: 'apple', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
  { id: 2, name: 'Dell', slug: 'dell', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/48/Dell_Logo.svg' },
  { id: 3, name: 'Asus', slug: 'asus', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/ASUS_Logo.svg' },
  { id: 4, name: 'Lenovo', slug: 'lenovo', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/28/Lenovo_logo_2015.svg' },
  { id: 5, name: 'HP', slug: 'hp', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_2012.svg' },
];

let products: Product[] = [
  {
    id: 1,
    categoryId: 1,
    brandId: 1,
    name: 'Apple MacBook Air M2 13.6 inch',
    slug: 'apple-macbook-air-m2-13-6-inch',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=60',
    summary: 'MacBook Air M2 thiết kế hoàn toàn mới, siêu mỏng 11.3mm, chip Apple M2 tiết kiệm điện, pin tới 18 giờ.',
    description: 'MacBook Air M2 mang ngôn ngữ thiết kế phẳng hiện đại của dòng Pro, trang bị màn hình Liquid Retina 13.6 inch sắc nét với độ sáng 500 nits. Chip Apple M2 cung cấp hiệu năng vượt trội cho công việc văn phòng, lập trình và chỉnh sửa hình ảnh mượt mà, cổng sạc MagSafe 3 tiện lợi.',
    isFeatured: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      {
        id: 1,
        productId: 1,
        sku: 'MBA-M2-8-256-GRY',
        cpu: 'Apple M2 (8 CPU / 8 GPU)',
        ramGb: 8,
        storage: '256GB SSD',
        vga: 'Apple M2 8-core GPU',
        screenSize: '13.6 inch Liquid Retina',
        color: 'Space Gray',
        price: 24990000,
        originalPrice: 27990000,
        stockQuantity: 15,
        isActive: true,
      },
      {
        id: 2,
        productId: 1,
        sku: 'MBA-M2-16-512-MID',
        cpu: 'Apple M2 (8 CPU / 10 GPU)',
        ramGb: 16,
        storage: '512GB SSD',
        vga: 'Apple M2 10-core GPU',
        screenSize: '13.6 inch Liquid Retina',
        color: 'Midnight',
        price: 31990000,
        originalPrice: 34990000,
        stockQuantity: 8,
        isActive: true,
      },
    ],
    reviews: [
      { id: 1, productId: 1, customerName: 'Lê Minh Tuấn', rating: 5, comment: 'Máy cực kỳ mượt mà, pin dùng cả ngày từ sáng đến tối vẫn còn 30%.', createdAt: '2026-10-20' },
      { id: 2, productId: 1, customerName: 'Đặng Phương Thảo', rating: 5, comment: 'Thiết kế mỏng nhẹ mang đi cà phê làm việc rất tiện, màn hình đẹp.', createdAt: '2026-10-22' },
    ],
  },
  {
    id: 2,
    categoryId: 2,
    brandId: 2,
    name: 'Dell XPS 13 Plus 9320',
    slug: 'dell-xps-13-plus-9320',
    thumbnailUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=60',
    summary: 'Đỉnh cao thiết kế tương lai với bàn phím tràn viền, touch bar điện dung và trackpad ẩn kính cảm ứng haptic.',
    description: 'Dell XPS 13 Plus 9320 định nghĩa lại phong cách laptop doanh nhân cao cấp. Vỏ nhôm nguyên khối cắt CNC tinh xảo, màn hình OLED độ phân giải cao chuẩn màu DCI-P3 100%, vi xử lý Intel Core i7 Gen 13 mạnh mẽ đáp ứng mọi tác vụ chuyên nghiệp.',
    isFeatured: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      {
        id: 3,
        productId: 2,
        sku: 'XPS-9320-16-512-SLV',
        cpu: 'Intel Core i7-1360P (12C/16T)',
        ramGb: 16,
        storage: '512GB PCIe 4.0 SSD',
        vga: 'Intel Iris Xe Graphics',
        screenSize: '13.4 inch FHD+ InfinityEdge',
        color: 'Platinum Silver',
        price: 36500000,
        originalPrice: 39500000,
        stockQuantity: 10,
        isActive: true,
      },
      {
        id: 4,
        productId: 2,
        sku: 'XPS-9320-32-1TB-GRP',
        cpu: 'Intel Core i7-1360P (12C/16T)',
        ramGb: 32,
        storage: '1TB PCIe 4.0 SSD',
        vga: 'Intel Iris Xe Graphics',
        screenSize: '13.4 inch 3.5K OLED Touch',
        color: 'Graphite',
        price: 43900000,
        originalPrice: 48000000,
        stockQuantity: 5,
        isActive: true,
      },
    ],
    reviews: [
      { id: 3, productId: 2, customerName: 'Hoàng Nam', rating: 5, comment: 'Bàn phím và trackpad ẩn của XPS 13 Plus nhìn như đến từ tương lai, build cực chắc chắn.', createdAt: '2026-10-21' },
    ],
  },
  {
    id: 3,
    categoryId: 3,
    brandId: 3,
    name: 'Asus ROG Zephyrus G14 GA402',
    slug: 'asus-rog-zephyrus-g14-ga402',
    thumbnailUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=60',
    summary: 'Laptop gaming 14 inch mỏng nhẹ đỉnh cao nhất thế giới với chip AMD Ryzen 7000 series và card đồ họa NVIDIA RTX 40 series.',
    description: 'Asus ROG Zephyrus G14 kết hợp sự di động tuyệt đối và sức mạnh đồ họa bùng nổ. Trọng lượng chỉ 1.65kg, màn hình ROG Nebula Display 165Hz QHD+ cực kỳ rực rỡ, hệ thống tản nhiệt buồng hơi kim loại lỏng Liquid Metal giữ máy luôn mát mẻ.',
    isFeatured: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      {
        id: 5,
        productId: 3,
        sku: 'ROG-G14-R7-16-4050-GRY',
        cpu: 'AMD Ryzen 7 7735HS',
        ramGb: 16,
        storage: '512GB NVMe Gen4',
        vga: 'NVIDIA GeForce RTX 4050 6GB',
        screenSize: '14 inch QHD+ 165Hz IPS',
        color: 'Eclipse Gray',
        price: 29990000,
        originalPrice: 33500000,
        stockQuantity: 12,
        isActive: true,
      },
      {
        id: 6,
        productId: 3,
        sku: 'ROG-G14-R9-32-4060-WHT',
        cpu: 'AMD Ryzen 9 7940HS',
        ramGb: 32,
        storage: '1TB NVMe Gen4',
        vga: 'NVIDIA GeForce RTX 4060 8GB',
        screenSize: '14 inch QHD+ 165Hz Nebula',
        color: 'Moonlight White',
        price: 39990000,
        originalPrice: 44000000,
        stockQuantity: 6,
        isActive: true,
      },
    ],
    reviews: [
      { id: 4, productId: 3, customerName: 'Vũ Quốc Huy', rating: 5, comment: 'Vừa chiến mượt Cyberpunk 2077 vừa mang đi làm việc văn phòng không bị hầm hố quá mức.', createdAt: '2026-10-18' },
    ],
  },
  {
    id: 4,
    categoryId: 2,
    brandId: 4,
    name: 'Lenovo ThinkPad T14s Gen 4',
    slug: 'lenovo-thinkpad-t14s-gen-4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=60',
    summary: 'Chiến binh doanh nghiệp bền bỉ chuẩn quân đội Mỹ MIL-STD-810H, bàn phím gõ êm số 1 thế giới.',
    description: 'Lenovo ThinkPad T14s Gen 4 là sự lựa chọn số 1 cho các chuyên gia công nghệ, lập trình viên và nhà quản lý. Khung vỏ sợi carbon siêu nhẹ, bàn phím ThinkPad trứ danh có hành trình phím sâu, bảo mật vân tay tích hợp nút nguồn và gạt che camera vật lý ThinkShutter.',
    isFeatured: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      {
        id: 7,
        productId: 4,
        sku: 'TP-T14S-I5-16-512-BLK',
        cpu: 'Intel Core i5-1335U',
        ramGb: 16,
        storage: '512GB SSD NVMe Opal',
        vga: 'Intel Iris Xe Graphics',
        screenSize: '14 inch WUXGA IPS Low Power',
        color: 'Thunder Black',
        price: 26490000,
        originalPrice: 28900000,
        stockQuantity: 14,
        isActive: true,
      },
      {
        id: 8,
        productId: 4,
        sku: 'TP-T14S-R7-32-1TB-BLK',
        cpu: 'AMD Ryzen 7 PRO 7840U',
        ramGb: 32,
        storage: '1TB SSD NVMe Opal',
        vga: 'AMD Radeon 780M',
        screenSize: '14 inch 2.8K OLED 90Hz',
        color: 'Deep Black',
        price: 33800000,
        originalPrice: 37500000,
        stockQuantity: 7,
        isActive: true,
      },
    ],
    reviews: [
      { id: 5, productId: 4, customerName: 'Nguyễn Hoàng Bách', rating: 5, comment: 'Bàn phím ThinkPad vẫn là tượng đài gõ code, hành trình phím sâu, máy nhẹ và rất bền.', createdAt: '2026-10-15' },
    ],
  },
  {
    id: 5,
    categoryId: 4,
    brandId: 5,
    name: 'HP Pavilion 15 eg3000',
    slug: 'hp-pavilion-15-eg3000',
    thumbnailUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=60',
    summary: 'Laptop học tập - văn phòng màn hình lớn 15.6 inch viền mỏng, thiết kế thanh lịch, âm thanh B&O chất lượng.',
    description: 'HP Pavilion 15 là mẫu laptop toàn diện cho sinh viên và nhân viên văn phòng. Màn hình IPS Full HD chống chói, bàn phím số phụ NumPad tiện lợi nhập liệu kế toán, vi xử lý Intel Core thế hệ 13 đảm bảo chạy tốt mọi ứng dụng văn phòng, lướt web, học online.',
    isFeatured: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      {
        id: 9,
        productId: 5,
        sku: 'HP-PAV15-I5-8-512-SLV',
        cpu: 'Intel Core i5-1335U',
        ramGb: 8,
        storage: '512GB SSD PCIe NVMe',
        vga: 'Intel Iris Xe Graphics',
        screenSize: '15.6 inch FHD IPS BrightView',
        color: 'Natural Silver',
        price: 14890000,
        originalPrice: 16990000,
        stockQuantity: 20,
        isActive: true,
      },
      {
        id: 10,
        productId: 5,
        sku: 'HP-PAV15-I7-16-512-GLD',
        cpu: 'Intel Core i7-1355U',
        ramGb: 16,
        storage: '512GB SSD PCIe NVMe',
        vga: 'Intel Iris Xe Graphics',
        screenSize: '15.6 inch FHD IPS',
        color: 'Warm Gold',
        price: 18990000,
        originalPrice: 21500000,
        stockQuantity: 15,
        isActive: true,
      },
    ],
    reviews: [
      { id: 6, productId: 5, customerName: 'Phạm Thu Trang', rating: 4, comment: 'Máy đẹp, phím số gõ nhập liệu kế toán tiện. Tầm giá 14 triệu quá ổn cho sinh viên.', createdAt: '2026-10-10' },
    ],
  },
];

let orders: Order[] = [
  {
    id: 1,
    orderCode: 'ORD-20261027-001',
    userId: 2,
    customerName: 'Nguyễn Văn A',
    customerPhone: '0987654321',
    customerEmail: 'nguyenvana@gmail.com',
    shippingAddress: 'Số 123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
    note: 'Giao giờ hành chính, gọi trước khi đến',
    totalAmount: 24990000,
    paymentMethod: 'COD',
    status: 'COMPLETED',
    createdAt: '2026-10-27T08:30:00Z',
    updatedAt: '2026-10-27T09:00:00Z',
    items: [
      {
        id: 1,
        orderId: 1,
        variantId: 1,
        productName: 'Apple MacBook Air M2 13.6 inch',
        variantInfo: 'M2 8-Core / 8GB RAM / 256GB SSD / Space Gray',
        price: 24990000,
        quantity: 1,
        subtotal: 24990000,
      },
    ],
  },
  {
    id: 2,
    orderCode: 'ORD-20261027-002',
    customerName: 'Trần Thị B',
    customerPhone: '0912345678',
    customerEmail: 'tranthib@hotmail.com',
    shippingAddress: 'Số 45 Cầu Giấy, Quận Cầu Giấy, Hà Nội',
    note: 'Kiểm tra hàng trước khi nhận',
    totalAmount: 29990000,
    paymentMethod: 'COD',
    status: 'PROCESSING',
    createdAt: '2026-10-27T10:15:00Z',
    updatedAt: '2026-10-27T10:15:00Z',
    items: [
      {
        id: 2,
        orderId: 2,
        variantId: 5,
        productName: 'Asus ROG Zephyrus G14 GA402',
        variantInfo: 'Ryzen 7 7735HS / 16GB RAM / 512GB SSD / RTX 4050 / Eclipse Gray',
        price: 29990000,
        quantity: 1,
        subtotal: 29990000,
      },
    ],
  },
];

export class StoreService {
  // Lấy danh mục
  static async getCategories(): Promise<Category[]> {
    if (isDatabaseActive()) {
      try {
        const client = getPrismaClient();
        const records = await client.category.findMany({
          orderBy: { displayOrder: 'asc' },
          select: { id: true, name: true, slug: true, description: true, displayOrder: true },
        });
        return records as Category[];
      } catch (err) {
        console.error('Error fetching categories from DB, fallback:', err);
      }
    }
    return categories;
  }

  // Lấy danh sách thương hiệu
  static async getBrands(): Promise<Brand[]> {
    if (isDatabaseActive()) {
      try {
        const client = getPrismaClient();
        const records = await client.brand.findMany({
          orderBy: { name: 'asc' },
          select: { id: true, name: true, slug: true, logoUrl: true },
        });
        return records as Brand[];
      } catch (err) {
        console.error('Error fetching brands from DB, fallback:', err);
      }
    }
    return brands;
  }

  // Lấy danh sách sản phẩm có bộ lọc (CPU, RAM, Giá, Thương hiệu, Danh mục, Từ khóa)
  static async getProducts(query: {
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    cpu?: string;
    ram?: number;
    search?: string;
    featured?: boolean;
    sort?: string;
    page?: number;
    limit?: number;
  }): Promise<{ products: Product[]; total: number; page: number; totalPages: number }> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;

    let filtered = products.filter((p) => p.isActive);

    // Lọc theo Category
    if (query.category) {
      const cat = categories.find((c) => c.slug === query.category);
      if (cat) {
        filtered = filtered.filter((p) => p.categoryId === cat.id);
      }
    }

    // Lọc theo Brand
    if (query.brand) {
      const b = brands.find((brand) => brand.slug === query.brand);
      if (b) {
        filtered = filtered.filter((p) => p.brandId === b.id);
      }
    }

    // Lọc theo Featured
    if (query.featured !== undefined) {
      filtered = filtered.filter((p) => p.isFeatured === query.featured);
    }

    // Lọc theo từ khóa Search
    if (query.search) {
      const keyword = query.search.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(keyword) ||
          p.summary?.toLowerCase().includes(keyword) ||
          p.variants?.some((v) => v.cpu.toLowerCase().includes(keyword))
      );
    }

    // Lọc theo thông số phần cứng của Variants (CPU, RAM, Giá)
    if (query.cpu || query.ram || query.minPrice !== undefined || query.maxPrice !== undefined) {
      filtered = filtered.filter((p) => {
        if (!p.variants || p.variants.length === 0) return false;
        return p.variants.some((v) => {
          let match = true;
          if (query.cpu && !v.cpu.toLowerCase().includes(query.cpu.toLowerCase())) {
            match = false;
          }
          if (query.ram && v.ramGb !== query.ram) {
            match = false;
          }
          if (query.minPrice !== undefined && v.price < query.minPrice) {
            match = false;
          }
          if (query.maxPrice !== undefined && v.price > query.maxPrice) {
            match = false;
          }
          return match;
        });
      });
    }

    // Gán thông tin Category và Brand vào product
    const enriched = filtered.map((p) => ({
      ...p,
      category: categories.find((c) => c.id === p.categoryId),
      brand: brands.find((b) => b.id === p.brandId),
    }));

    // Sắp xếp
    if (query.sort === 'price-asc') {
      enriched.sort((a, b) => (a.variants?.[0]?.price || 0) - (b.variants?.[0]?.price || 0));
    } else if (query.sort === 'price-desc') {
      enriched.sort((a, b) => (b.variants?.[0]?.price || 0) - (a.variants?.[0]?.price || 0));
    } else if (query.sort === 'name-asc') {
      enriched.sort((a, b) => a.name.localeCompare(b.name));
    }

    const total = enriched.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const paginated = enriched.slice((page - 1) * limit, page * limit);

    return {
      products: paginated,
      total,
      page,
      totalPages,
    };
  }

  // Lấy chi tiết sản phẩm theo Slug
  static async getProductBySlug(slug: string): Promise<Product | null> {
    const p = products.find((prod) => prod.slug === slug && prod.isActive);
    if (!p) return null;

    return {
      ...p,
      category: categories.find((c) => c.id === p.categoryId),
      brand: brands.find((b) => b.id === p.brandId),
    };
  }

  // Lấy biến thể sản phẩm theo ID
  static async getVariantById(variantId: number): Promise<ProductVariant | null> {
    for (const p of products) {
      const v = p.variants?.find((variant) => variant.id === variantId);
      if (v) return v;
    }
    return null;
  }

  // Tạo đơn hàng mới (Hỗ trợ COD siêu tiện lợi)
  static async createOrder(orderInput: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    shippingAddress: string;
    note?: string;
    paymentMethod: string;
    items: { variantId: number; quantity: number }[];
  }): Promise<Order> {
    const timestamp = Date.now().toString().slice(-6);
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    const orderCode = `ORD-${timestamp}-${randomHex}`;

    let totalAmount = 0;
    const orderItems: OrderItem[] = [];

    const newOrderId = orders.length > 0 ? Math.max(...orders.map((o) => o.id)) + 1 : 1;
    let itemIdSeq = 100 + orders.length;

    for (const item of orderInput.items) {
      let foundProduct: Product | undefined;
      let foundVariant: ProductVariant | undefined;

      for (const p of products) {
        const v = p.variants?.find((variant) => variant.id === item.variantId);
        if (v) {
          foundProduct = p;
          foundVariant = v;
          break;
        }
      }

      if (!foundProduct || !foundVariant) {
        throw new Error(`Sản phẩm với biến thể ID ${item.variantId} không tồn tại.`);
      }

      // Giảm tồn kho
      if (foundVariant.stockQuantity < item.quantity) {
        throw new Error(`Phiên bản ${foundVariant.sku} chỉ còn ${foundVariant.stockQuantity} sản phẩm trong kho.`);
      }
      foundVariant.stockQuantity -= item.quantity;

      const subtotal = foundVariant.price * item.quantity;
      totalAmount += subtotal;

      orderItems.push({
        id: itemIdSeq++,
        orderId: newOrderId,
        variantId: foundVariant.id,
        productName: foundProduct.name,
        variantInfo: `${foundVariant.cpu} / ${foundVariant.ramGb}GB / ${foundVariant.storage} / ${foundVariant.color}`,
        price: foundVariant.price,
        quantity: item.quantity,
        subtotal,
      });
    }

    const newOrder: Order = {
      id: newOrderId,
      orderCode,
      customerName: orderInput.customerName.trim(),
      customerPhone: orderInput.customerPhone.trim(),
      customerEmail: orderInput.customerEmail?.trim(),
      shippingAddress: orderInput.shippingAddress.trim(),
      note: orderInput.note?.trim(),
      totalAmount,
      paymentMethod: orderInput.paymentMethod || 'COD',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: orderItems,
    };

    orders.unshift(newOrder); // Đưa đơn mới lên đầu danh sách
    return newOrder;
  }

  // Tra cứu đơn hàng theo Mã đơn hoặc SĐT
  static async getOrderByCodeOrPhone(query: string): Promise<Order[]> {
    const q = query.trim().toUpperCase();
    return orders.filter((o) => o.orderCode.toUpperCase() === q || o.customerPhone === query.trim());
  }

  // ================= ADMIN SERVICES =================
  static async getAllOrdersAdmin(): Promise<Order[]> {
    return orders;
  }

  static async updateOrderStatus(
    orderId: number,
    status: 'PENDING' | 'PROCESSING' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED'
  ): Promise<Order | null> {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return null;
    order.status = status;
    order.updatedAt = new Date().toISOString();
    return order;
  }

  static async getAllProductsAdmin(): Promise<Product[]> {
    return products.map((p) => ({
      ...p,
      category: categories.find((c) => c.id === p.categoryId),
      brand: brands.find((b) => b.id === p.brandId),
    }));
  }

  static async createProduct(productData: {
    categoryId: number;
    brandId: number;
    name: string;
    slug: string;
    thumbnailUrl: string;
    summary?: string;
    description?: string;
    isFeatured?: boolean;
    variants: {
      sku: string;
      cpu: string;
      ramGb: number;
      storage: string;
      vga?: string;
      screenSize: string;
      color: string;
      price: number;
      originalPrice?: number;
      stockQuantity: number;
    }[];
  }): Promise<Product> {
    const newId = products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;
    let variantIdSeq = 200 + newId * 10;

    const variants: ProductVariant[] = productData.variants.map((v) => ({
      id: variantIdSeq++,
      productId: newId,
      sku: v.sku,
      cpu: v.cpu,
      ramGb: v.ramGb,
      storage: v.storage,
      vga: v.vga,
      screenSize: v.screenSize,
      color: v.color,
      price: v.price,
      originalPrice: v.originalPrice,
      stockQuantity: v.stockQuantity,
      isActive: true,
    }));

    const newProduct: Product = {
      id: newId,
      categoryId: productData.categoryId,
      brandId: productData.brandId,
      name: productData.name,
      slug: productData.slug,
      thumbnailUrl: productData.thumbnailUrl,
      summary: productData.summary,
      description: productData.description,
      isFeatured: !!productData.isFeatured,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      variants,
      reviews: [],
    };

    products.unshift(newProduct);
    return newProduct;
  }

  static async updateProduct(
    id: number,
    data: Partial<Product>
  ): Promise<Product | null> {
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return null;

    products[index] = {
      ...products[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return products[index];
  }

  static async deleteProduct(id: number): Promise<boolean> {
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return false;
    products.splice(index, 1);
    return true;
  }

  // ================= USER & AUTH SERVICES =================
  static async findUserByEmail(email: string): Promise<User | null> {
    const normalized = email.trim().toLowerCase();
    if (isDatabaseActive()) {
      try {
        const client = getPrismaClient();
        const dbUser = await client.user.findUnique({
          where: { email: normalized },
        });
        if (dbUser) return dbUser as any;
      } catch (err) {
        console.error('Error finding user in DB, fallback:', err);
      }
    }
    return users.find((u) => u.email.toLowerCase() === normalized) || null;
  }

  static async findUserById(id: number): Promise<AuthUser | null> {
    if (isDatabaseActive()) {
      try {
        const client = getPrismaClient();
        const dbUser = await client.user.findUnique({
          where: { id },
          select: { id: true, email: true, fullName: true, phone: true, role: true, isActive: true, createdAt: true },
        });
        if (dbUser) return { ...dbUser, createdAt: dbUser.createdAt.toISOString() } as AuthUser;
      } catch (err) {
        console.error('Error finding user by ID in DB, fallback:', err);
      }
    }
    const user = users.find((u) => u.id === id);
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }

  static async createUser(input: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    role?: UserRole;
  }): Promise<AuthUser> {
    const normalized = input.email.trim().toLowerCase();
    const existing = await this.findUserByEmail(normalized);
    if (existing) {
      throw new Error('Email này đã được đăng ký tài khoản.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(input.password, salt);
    const role: UserRole = input.role || 'CUSTOMER';

    if (isDatabaseActive()) {
      try {
        const client = getPrismaClient();
        const created = await client.user.create({
          data: {
            email: normalized,
            passwordHash,
            fullName: input.fullName.trim(),
            phone: input.phone?.trim() || null,
            role,
            isActive: true,
          },
        });
        return {
          id: created.id,
          email: created.email,
          fullName: created.fullName,
          phone: created.phone,
          role: created.role as UserRole,
          isActive: created.isActive,
          createdAt: created.createdAt.toISOString(),
        };
      } catch (err) {
        console.error('Error creating user in DB, fallback to memory:', err);
      }
    }

    const newId = users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;
    const newUser: User = {
      id: newId,
      email: normalized,
      passwordHash,
      fullName: input.fullName.trim(),
      phone: input.phone?.trim() || null,
      role,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.push(newUser);
    return {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
      phone: newUser.phone,
      role: newUser.role,
      isActive: newUser.isActive,
      createdAt: newUser.createdAt,
    };
  }

  static async getAllUsersAdmin(): Promise<AuthUser[]> {
    if (isDatabaseActive()) {
      try {
        const client = getPrismaClient();
        const records = await client.user.findMany({
          orderBy: { id: 'desc' },
          select: { id: true, email: true, fullName: true, phone: true, role: true, isActive: true, createdAt: true },
        });
        return records.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })) as AuthUser[];
      } catch (err) {
        console.error('Error fetching users from DB, fallback:', err);
      }
    }
    return users.map((u) => ({
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      phone: u.phone,
      role: u.role,
      isActive: u.isActive,
      createdAt: u.createdAt,
    }));
  }

  static async updateUserStatus(id: number, isActive: boolean): Promise<AuthUser | null> {
    const user = users.find((u) => u.id === id);
    if (!user) return null;
    user.isActive = isActive;
    user.updatedAt = new Date().toISOString();
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }

  static async updateUserRole(id: number, role: UserRole): Promise<AuthUser | null> {
    const user = users.find((u) => u.id === id);
    if (!user) return null;
    user.role = role;
    user.updatedAt = new Date().toISOString();
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }

  static async deleteUser(id: number): Promise<boolean> {
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return false;
    users.splice(index, 1);
    return true;
  }
}
